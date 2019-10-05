# 7.2: Algebra Puzzle - Native Segwit P2WSH

> To follow along this tutorial
> * Execute all the transaction code in one go by typing `node code/filename.js`   
> * Or enter the commands step-by-step by `cd` into `./code` then type `node` in a terminal to open the Node.js REPL   
> * Open the Bitcoin Core GUI console or use `bitcoin-cli` for the Bitcoin Core commands
> * Use `bx` aka `Libbitcoin-explorer` as a handy complement 

> Read more about P2WSH in [BIP141 - Segregated Witness](https://github.com/bitcoin/bips/blob/master/bip-0141.mediawiki#p2wsh)

Let's create a simple maths puzzle with a native Segwit P2WSH transaction.


## Creating and Funding the P2WSH 
 
Import libraries, test wallets and set the network
```javascript
const bitcoin = require('bitcoinjs-lib')
const { alice } = require('./wallets.json')
const network = bitcoin.networks.regtest
```

Create the witness script and generate its address.
> In a P2WSH context, a redeem script is called a witness script.
```javascript
const witnessScript = bitcoin.script.compile([
  bitcoin.opcodes.OP_ADD,
  bitcoin.opcodes.OP_5,
  bitcoin.opcodes.OP_EQUAL])
```

The output of our funding transaction will have a locking script composed of <00 version byte> + <32-bytes hash witness program>.
SHA256 of the witnessScript must match the 32-byte witness program.
```javascript
witnessScript.toString('hex')
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
const p2wsh = bitcoin.payments.p2wsh({redeem: {output: witnessScript, network}, network})
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


## Creating the witness

Now we can update the transaction with the witness, providing a solution to the maths problem plus the problem itself.

We provide `02` and `03` as an answer, plus the witness script. 
> Note that we are pushing the integer values, not the corresponding opcode values.
```javascript
const witness = [Buffer.from('02','hex'), Buffer.from('03','hex'), p2wsh.redeem.output]
tx.setWitness(0, witness)
```

We don't need to sign this transaction since the witness script doesn't ask for a signature.

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

In the vin section, we note that the `scriptSig` field is empty, and that our solution data and witness script are located
in the witness `txinwitness` field. 

The SHA256 hash of the witness script, last item in `txinwitness`, is compared against the 32-byte hash located in the P2WSH UTXO we are 
spending.

The script is then executed with the remaining data from the witness `txinwitness` field.


## What's Next?

Continue "PART THREE: PAY TO SCRIPT HASH" with [7.3: Algebra Puzzle - Embedded Segwit P2SH-P2WSH](07_3_P2SH_P2WSH_Algebra_Puzzle.md).
