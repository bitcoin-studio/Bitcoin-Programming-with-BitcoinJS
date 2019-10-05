# 4.2: Typical Transaction (1 input, 2 outputs) - Native Segwit P2WPKH

> To follow along this tutorial
> * Execute all the transaction code in one go by typing `node code/filename.js`   
> * Or enter the commands step-by-step by `cd` into `./code` then type `node` in a terminal to open the Node.js REPL   
> * Open the Bitcoin Core GUI console or use `bitcoin-cli` for the Bitcoin Core commands
> * Use `bx` aka `Libbitcoin-explorer` as a handy complement 

Let's create a typical P2WPKH transaction, spending 1 P2WPKH UTXO and creating 2 new P2WPKH UTXOs, one for the actual 
payment and one for the change.


## Create a UTXO to spend from
 
Import libraries, test wallets and set the network
```javascript
const bitcoin = require('bitcoinjs-lib')
const { alice, bob } = require('./wallets.json')
const network = bitcoin.networks.regtest
```

Send 1 BTC to alice_1 native Segwit P2WPKH address in order to create a P2WPKH UTXO.
> Check out the address in your `wallets.json` file in the `code` directory. Replace the address if necessary.
```
$ sendtoaddress bcrt1qlwyzpu67l7s9gwv4gzuv4psypkxa4fx4ggs05g 1
```

Get the output index so that we have the outpoint (txid / vout).
> Find the output index (or vout) under `details > vout`.
```
$ gettransaction "txid"
```


## Creating the transaction

Now let's spend the UTXO with BitcoinJS.

Create a bitcoinJS key pair object for alice_1, the spender of our new UTXO, and the only one capable of spending it. 
```javascript
const keyPairAlice1 = bitcoin.ECPair.fromWIF(alice[1].wif, network)
const p2wpkhAlice1 = bitcoin.payments.p2wpkh({pubkey: keyPairAlice1.publicKey, network})
```

Create a key pair object and a P2PKH address for the recipient bob_1.
```javascript
const keyPairBob1 = bitcoin.ECPair.fromWIF(bob[1].wif, network)
const p2wpkhBob1 = bitcoin.payments.p2wpkh({pubkey: keyPairBob1.publicKey, network})
```

Create a BitcoinJS transaction builder object.
```javascript
const txb = new bitcoin.TransactionBuilder(network)
```

Create the input by providing the outpoint but also the script of the previous transaction (vout > scriptPubKey > hex).
Adding the prevTxScript is a specificity of P2WPKH spending.
> The script is composed as follow: <version program 00> PUSHBYTES_14 <witness program>
> The HASH160 of the public key must match the 20-bytes witness program. <br/>
> `$ bx bitcoin160 03745c9aceb84dcdeddf2c3cdc1edb0b0b5af2f9bf85612d73fa6394758eaee35d` <br/>
> fb8820f35effa054399540b8ca86040d8ddaa4d5 <br/>
> or with bitcoinJS
> bitcoin.crypto.hash160(Buffer.from('03745c9aceb84dcdeddf2c3cdc1edb0b0b5af2f9bf85612d73fa6394758eaee35d', 'hex')).toString('hex')
```javascript
// txb.addInput(prevTx, vout, sequence, prevTxScript)
txb.addInput('TX_ID', TX_VOUT, null, p2wpkhAlice1.output) 
```

Add the output #1 with the bob_1 P2WPKH recipient address and the amount of 0.5 BTC.
Add the output #2 with alice's change address (the same one or a new one for better privacy) and the amount of 0.499 BTC.
```javascript
txb.addOutput(p2wpkhBob1.address, 5e7)
txb.addOutput(p2wpkhAlice1.address, 499e5)
```

> 100 000 000 - (50 000 000 + 49 900 000) = 100 000
> 100 000 satoshis equals 0,001 BTC, this is the miner fee.

We don't have to specify any redeem or witness scripts here, since we are spending a native segwit UTXO.
But we need to sign the input value.
```javascript
// txb.sign(index, keyPair, redeemScript, sign.hashType, value, witnessScript)
txb.sign(0, keyPairAlice1, null, null, 1e8, null)
```

Finally we can build the transaction and get the raw hex serialization.
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

`sendrawtransaction` returns the transaction ID, with which you can inspect your transaction again.
> Don't forget the second argument. If false, it returns the hex string, otherwise it returns a detailed json object.
```
$ getrawtransaction "txid" true
```


## Observations

In the vin section we note that `scriptSig` is empty and that we have an additional `txinwitness` field which contains 
Alice signature and public key. The semantics of P2WPKH is the same as the semantics of P2PKH, except that the signature 
is not placed at the same location as before.

In the vout section we have two `witness_v0_keyhash` outputs, which is the code name for native Segwit.


## What's Next?

Continue "PART TWO: PAY TO PUBLIC KEY HASH" with [5.0: Spend a Embedded Segwit P2SH-P2WPKH UTXO](05_0_P2SH_P2WPKH_Spend_1_1.md).
