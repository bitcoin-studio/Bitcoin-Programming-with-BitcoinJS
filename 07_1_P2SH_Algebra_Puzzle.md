# 7.1: Algebra Puzzle - Legacy P2SH

> To follow along this tutorial
> * Execute all the transaction code in one go by typing `node code/filename.js`   
> * Or enter the commands step-by-step by `cd` into `./code` then type `node` in a terminal to open the Node.js REPL   
> * Open the Bitcoin Core GUI console or use `bitcoin-cli` for the Bitcoin Core commands
> * Use `bx` aka `Libbitcoin-explorer` as a handy complement 

Let's create a simple maths puzzle with a legacy P2SH transaction.


## Creating and Funding the P2SH 
 
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
  
console.log('redeemScript  ', redeemScript.toString('hex'))  
```

You can decode the script in Bitcoin Core CLI.
```
$ decodescript 935587
```

The `p2sh` method will generate an object that contains the P2SH address.
```javascript
const p2sh = bitcoin.payments.p2sh({redeem: {output: redeemScript, network}, network})
console.log('p2sh.address  ', p2sh.address)
```

Let's fund this address with 1 BTC. This is the reward for whoever as the solution to the locking script.
```
$ sendtoaddress 2N7WfHK1ftrTdhWej8rnFNR7guhvhfGWwFR 1
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

Alice_1 wants to send the funds to her P2WPKH address.
```javascript
const keyPairAlice1 = bitcoin.ECPair.fromWIF(alice[1].wif, network)
const p2wpkhAlice1 = bitcoin.payments.p2wpkh({pubkey: keyPairAlice1.publicKey, network})
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
txb.addOutput(p2wpkhAlice1.address, 999e5)
```

Prepare the transaction.
```javascript
const tx = txb.buildIncomplete()
```


## Creating the unlocking script

Now we can update the transaction with the unlocking script, providing a solution to the maths problem.

We provide `02` and `03` as an answer, plus the redeem script. 
```javascript
const InputScriptP2SH = bitcoin.script.compile([bitcoin.opcodes.OP_2, bitcoin.opcodes.OP_3, p2sh.redeem.output])
tx.setInputScript(0, InputScriptP2SH)
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

We can decrypt the unlocking script in Bitcoin Core CLI with `decodescript`.
You will notice that it is the concatenation of the corresponding hex value of the specified opcodes, `OP_2`, `OP_3` and 
the redeem script `OP_ADD OP_5 OP_EQUAL`.

Be aware that the hex script is the serialized version, which includes a <PUSHBYTES_3> before the redeem script. 
In order to decode the script we need to remove this pushbyte.
```
$ decodescript 5253935587
``` 


## What's Next?

Continue "PART THREE: PAY TO SCRIPT HASH" with [7.2: Algebra Puzzle - Native Segwit P2WSH](07_2_P2WSH_Algebra_Puzzle.md).
