# 7.2: Algebra Puzzle - Native Segwit P2WSH

> To follow along this tutorial and enter the commands step-by-step
> * Type `node` in a terminal after `cd` into `./code` for a Javascript prompt
> * Open the Bitcoin Core GUI console or use `bitcoin-cli` for the Bitcoin Core commands
> * Use `bx` aka `Libbitcoin-explorer` as a handy complement 

Let's create a simple maths puzzle with a native Segwit P2WSH transaction.


## Creating and Funding the P2WSH 
 
Import libraries, test wallets and set the network
```javascript
const bitcoin = require('bitcoinjs-lib')
const { alice } = require('./wallets.json')
const network = bitcoin.networks.regtest
```

Create the script and generate its address.
```javascript
const redeemScript = bitcoin.script.compile([
  bitcoin.opcodes.OP_ADD,
  bitcoin.opcodes.OP_5,
  bitcoin.opcodes.OP_EQUAL])
```

The output of our funding transaction will have a locking script composed of <version byte> + <32-bytes hash>.
This 32 bytes hash is the SHA256 of our redeem script.
```javascript
redeemScript.toString('hex')
// '935587'
bitcoin.crypto.sha256(Buffer.from('935587', 'hex')).toString('hex')
// '0afd85470f76425c9f81a91d37f9ee8ac0289d479a091af64787e0930eef3b5a'
```

You can decode the script in Bitcoin Core CLI.
```
$ decodescript 935587
```

The `p2wsh` method will generate an object that contains the P2WSH address.
```javascript
const p2wsh = bitcoin.payments.p2wsh({redeem: {output: redeemScript, network}, network})
console.log('p2wsh.address  ', p2wsh.address)
```

Send 1 BTC to this P2WSH address, which is the reward for whoever as the solution to the locking script.
```
$ sendtoaddress bcrt1qpt7c23c0wep9e8up4ywn070w3tqz3828ngy34aj8slsfxrh08ddq2d2pyu 1
```
> We can note that anyone can create this script and generate the corresponding address, it will always result in the same 
> address.
  
Get the output index so that we have the outpoint (txid / vout).
> Find the output index (or vout) under `details > vout`.
```
$ gettransaction "txid"
```


## Preparing the spending transaction

Now let's prepare the spending transaction by setting input and output.

Alice_0 wants to send the funds to her P2WPKH address.
```javascript
const keyPairAlice0 = bitcoin.ECPair.fromWIF(alice[0].wif, network)
const p2wpkhAlice0 = bitcoin.payments.p2wpkh({pubkey: keyPairAlice0.publicKey, network})
```

Create a BitcoinJS transaction builder object.
```javascript
const txb = new bitcoin.TransactionBuilder(network)
```

Create the input by referencing the outpoint of our P2SH funding transaction.
```javascript
txb.addInput('TX_ID', TX_VOUT)
```

Create the output, leaving 100 000 satoshis as mining fees.
```javascript
txb.addOutput(p2wpkhAlice0.address, 999e5)
```

Prepare the transaction.
```javascript
const tx = txb.buildIncomplete()
```


## Creating the witness stack

Now we can update the transaction with the witness stack, providing a solution to the maths problem.

We provide `02` and `03` as an answer, plus the redeem script. 
> Note that we are pushing the integer values, not the corresponding opcode values.
```javascript
const witnessStack = [Buffer.from('02','hex'), Buffer.from('03','hex'), p2wsh.redeem.output]
tx.setWitness(0, witnessStack)
```

We don't need to sign this transaction since the redeem script doesn't ask for a signature.

Get the raw hex serialization.
> No `build` step here as we have already called `buildIncomplete`
```javascript
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

In the vin section, we note that the `scriptSig` field is empty, and that our solution data and redeem script are located
in `txinwitness` field. 

The SHA256 hash of the redeem script, last item in `txinwitness`, has to match the hash located in the P2WSH UTXO we are 
spending.

The witness stack is then executed.


## What's Next?

Continue "PART THREE: PAY TO SCRIPT HASH" with [7.3: Algebra Puzzle - Embedded Segwit P2SH-P2WSH](07_3_P2SH_P2WSH_Algebra_Puzzle.md).
