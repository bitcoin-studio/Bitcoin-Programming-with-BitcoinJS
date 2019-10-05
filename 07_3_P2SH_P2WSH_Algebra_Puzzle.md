# 7.3: Algebra Puzzle - Embedded Segwit P2SH-P2WSH

> To follow along this tutorial
> * Execute all the transaction code in one go by typing `node code/filename.js`   
> * Or enter the commands step-by-step by `cd` into `./code` then type `node` in a terminal to open the Node.js REPL   
> * Open the Bitcoin Core GUI console or use `bitcoin-cli` for the Bitcoin Core commands
> * Use `bx` aka `Libbitcoin-explorer` as a handy complement 

> Read more about in [P2WSH nested in BIP16 P2SH](https://github.com/bitcoin/bips/blob/master/bip-0141.mediawiki#p2wsh-nested-in-bip16-p2sh)

Let's create a simple maths puzzle with an embedded Segwit P2SH-P2WSH transaction.


## Creating and Funding the P2SH-P2WSH 
 
Import libraries, test wallets and set the network
```javascript
const bitcoin = require('bitcoinjs-lib')
const { alice } = require('./wallets.json')
const network = bitcoin.networks.regtest
```

Create the witness script and generate its address.
```javascript
const witnessScript = bitcoin.script.compile([
  bitcoin.opcodes.OP_ADD,
  bitcoin.opcodes.OP_5,
  bitcoin.opcodes.OP_EQUAL])
  
console.log('witnessScript  ', witnessScript.toString('hex'))  
```

You can decode the script in Bitcoin Core CLI.
```
$ decodescript 935587
```

Put the `p2wsh` object into the `p2sh` redeem parameter. 
```javascript
const p2wsh = bitcoin.payments.p2wsh({redeem: {output: witnessScript, network}, network})
const p2sh = bitcoin.payments.p2sh({redeem: p2wsh, network: network})
console.log('p2sh.address:  ', p2sh.address)
```

Send 1 BTC to this P2SH-P2WSH address, which is the reward for whoever as the solution to the locking script.
```
$ sendtoaddress 2MwnRrQxKhCdr8e3vbL7ymhtzQFYPTx9xww 1
```
> We can note that anyone can create this script and generate the corresponding address, it will always result in the same 
> address.

Generate one block to dave_1's P2WPKH address so that we can spend the UTXO.
```
$ generatetoaddress 1 bcrt1qnqud2pjfpkqrnfzxy4kp5g98r8v886wgvs9e7r
```
  
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

Now we can update the transaction with the version byte 0 and the witness program that will be placed in the `scriptSig` 
field, and the witness composed of the solution to our maths problem (witness stack) and the maths problem itself (witness script). 

> When we are spending from a P2WSH UTXO the witness script hash is produced automatically.
> However, when we are spending from a P2SH UTXO (our P2SH-P2WSH is a regular P2SH UTXO), we need to place the witness 
> script hash ourselves in the scriptSig, preceded by a 0 version byte so that the interpreter recognizes that it actually 
> is a witness program.
> If the version byte is 0 and the witness program is 32 bytes it is interpreted as a P2WSH program.

Create the input script.
> Serialized version byte + witness program: `<0 <32-byte-hash>>`
```javascript
const scriptSig = bitcoin.script.compile([p2wsh.output])
tx.setInputScript(0, scriptSig)
```

The only item in scriptSig `<0 <32-byte-hash>>` is hashed with HASH160, compared against the 20-byte-hash in the locking 
script of the P2SH UTXO we are spending, and interpreted as `0 <32-byte-hash>`.
> HASH160 of the scriptSig asm version, without pushbytes(22).
```javascript
bitcoin.crypto.hash160(scriptSig.slice(1)).toString('hex')
// '31c74d4132ecfdb577695cd23be18346f048cb24'
```

We create the witness stack, providing `02` and `03` as an answer, plus the witness script. 
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

In the vin section, we note that the scriptSig contains a 0 version byte and a witness program, which is the SHA256 
32-bytes hash of the witness script.

ScriptSig (asm version) is hashed with HASH160 and compared against the 20-byte-hash in the locking script of the UTXO 
we are spending.
```javascript
bitcoin.crypto.hash160(Buffer.from('00200afd85470f76425c9f81a91d37f9ee8ac0289d479a091af64787e0930eef3b5a', 'hex')).toString('hex')
// '31c74d4132ecfdb577695cd23be18346f048cb24'
```

ScriptSig is then interpreted as a P2WSH and triggers the execution of the witness script.


## What's Next?

Continue "PART THREE: PAY TO SCRIPT HASH" with [7.4: Computational Puzzle: SHA-1 Collision - Legacy P2SH](07_4_P2SH_Computational_Puzzle_SHA-1_Collision.md).
