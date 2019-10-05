# 8.3: Multi-signature Embedded Segwit 2 of 4

> To follow along this tutorial
> * Execute all the transaction code in one go by typing `node code/filename.js`   
> * Or enter the commands step-by-step by `cd` into `./code` then type `node` in a terminal to open the Node.js REPL   
> * Open the Bitcoin Core GUI console or use `bitcoin-cli` for the Bitcoin Core commands
> * Use `bx` aka `Libbitcoin-explorer` as a handy complement 

Let's create a 2 of 4 multi-signature with an embedded Segwit P2SH-P2WSH transaction.


## Creating and Funding the P2SH 
 
Import libraries, test wallets and set the network
```javascript
const bitcoin = require('bitcoinjs-lib')
const { alice, bob, carol, dave } = require('./wallets.json')
const network = bitcoin.networks.regtest
```

Prepare four keypairs.
```javascript
const keyPairAlice1 = bitcoin.ECPair.fromWIF(alice[1].wif, network)
const keyPairBob1 = bitcoin.ECPair.fromWIF(bob[1].wif, network)
const keyPairCarol1 = bitcoin.ECPair.fromWIF(carol[1].wif, network)
const keyPairDave1 = bitcoin.ECPair.fromWIF(dave[1].wif, network)
```

And an other alice_2 that will redeem the multi-signature funds.
```javascript
const keyPairAlice2 = bitcoin.ECPair.fromWIF(alice[2].wif, network)
const p2wpkhAlice2 = bitcoin.payments.p2wpkh({pubkey: keyPairAlice2.publicKey, network})
```

Create the locking script with the special `p2ms` payment method.
```javascript
const p2ms = bitcoin.payments.p2ms({
  m: 2, pubkeys: [
    keyPairAlice1.publicKey,
    keyPairBob1.publicKey,
    keyPairCarol1.publicKey,
    keyPairDave1.publicKey], network})
```

Check the locking script.
```
$ decodescript [p2ms.output.toString('hex')]
``` 
`"2 03745c9aceb84dcdeddf2c3cdc1edb0b0b5af2f9bf85612d73fa6394758eaee35d 
027efbabf425077cdbceb73f6681c7ebe2ade74a65ea57ebcf0c42364d3822c590 
023a11cfcedb993ff2e7523f92e359c4454072a66d42e8b74b4b27a8a1258abddd 
02e9d617f38f8c3ab9a6bde36ce991bafb295d7adba457699f8620c8160ec9e87a 4 OP_CHECKMULTISIG"`

Feed the `p2sh` method with the `p2wsh` object.
```javascript
const p2wsh = bitcoin.payments.p2wsh({redeem: p2ms, network})
const p2sh = bitcoin.payments.p2sh({redeem: p2wsh, network})
```

Send 1 BTC to this P2SH address. 
```
$ sendtoaddress 2N4LnN5rp8JAmqE3LBVQhYEQg83piAF15sX 1
```

Get the output index so that we have the outpoint (txid / vout).
> Find the output index (or vout) under `details > vout`.
```
$ gettransaction "txid"
```


## Preparing the spending transaction

Now let's prepare the spending transaction by setting input and output and having two people (private keys) to sign the 
transaction. 
Here alice_1 and bob_1 will redeem the P2SH-P2WSH multi-signature and send the funds to alice_2 P2WPKH address.

Create a BitcoinJS transaction builder object.
```javascript
const txb = new bitcoin.TransactionBuilder(network)
```

Create the input by referencing the outpoint of our P2SH funding transaction.
Create the output that will send the funds to Alice_1 P2WPKH address, leaving 100 000 satoshis as mining fees.
```javascript
txb.addInput('TX_ID', TX_VOUT)
txb.addOutput(p2wpkhAlice2.address, 999e5)
```

Alice_0 and Bob_0 now sign the transaction.
Note that, because we are doing a P2SH-P2WSH, we need to provide the locking script as the redeemScript third parameter, 
the same script as the witnessScript sixth parameter, as well as the input value.
```javascript
// txb.sign(index, keyPair, redeemScript, sign.hashType, value, witnessScript)
txb.sign(0, keyPairAlice1, p2sh.redeem.output, null, 1e8, p2wsh.redeem.output)
txb.sign(0, keyPairBob1, p2sh.redeem.output, null, 1e8, p2wsh.redeem.output)
```

Build the transaction and get the raw hex serialization.
```javascript
const tx = txb.build()
console.log('tx.toHex()  ', tx.toHex())
```

Inspect the raw transaction with Bitcoin Core CLI, check that everything is correct.
```
$ decoderawtransaction "hexstring"
```


## Broadcasting the transaction

It's time to broadcast the transaction via Bitcoin Core CLI.
```
$ sendrawtransaction "hexstring"
```

Inspect the transaction.
```
$ getrawtransaction "txid" true
```


## Observations

We can see that the scriptSig is a special unlocking script that contains the version byte `00` followed by a 32-bytes 
witness program. This script (asm) has to match the HASH160 contained in the P2SH UTXO script we are spending.

Verify the unlocking script HASH160.
```
$ bx bitcoin160 '00205b07dcc35fc2b29db80be059e495c88f5b7609c1e3d888c14240678f00217b3d'   
79b67d4c7bff512939e90e170ee9b969eb1203a8   
```
or
```javascript
bitcoin.crypto.hash160(Buffer.from('00205b07dcc35fc2b29db80be059e495c88f5b7609c1e3d888c14240678f00217b3d', 'hex')).toString('hex')
```

After checking hash equality, the script interpreter recognize that it is actually a Segwit transaction thanks to the 
version byte and triggers execution of the witness data.
The witness, located in the `txinwitness` field contains
  * an empty string that will convert to a dummy but mandatory `00` value due to a bug in `OP_CHECKMULTISIG`
  * Alice_1 and bob_1 signatures
  * and our witness script


## What's Next?

Continue "PART THREE: PAY TO SCRIPT HASH" with [9.0: Timelock Transactions](09_0_Timelock_Transactions.md).
