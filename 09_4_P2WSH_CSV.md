# 9.4: Script with CHECKSEQUENCEVERIFY - Native Segwit P2WSH

> To follow along this tutorial
> * Execute all the transaction code in one go by typing `node code/filename.js`   
> * Or enter the commands step-by-step by `cd` into `./code` then type `node` in a terminal to open the Node.js REPL   
> * Open the Bitcoin Core GUI console or use `bitcoin-cli` for the Bitcoin Core commands
> * Use `bx` aka `Libbitcoin-explorer` as a handy complement 

Let's create a native Segwit P2WSH transaction with a script that contains the `OP_CHECKSEQUENCEVERIFY` relative timelock 
opcode.
The script is almost the same as **_[9.2: Script with CHECKLOCKTIMEVERIFY - Native Segwit P2WSH](09_2_P2WSH_CLTV.md)_** 
but with a relative timelock of 5 blocks.

> To read more about OP_CHECKSEQUENCEVERIFY 
> * [BIP112 - CHECKSEQUENCEVERIFY](https://github.com/bitcoin/bips/blob/master/bip-0112.mediawiki)
> * [BIP68 - Relative lock-time using consensus-enforced sequence numbers](https://github.com/bitcoin/bips/blob/master/bip-0068.mediawiki)

> Read more about P2WSH in [BIP141 - Segregated Witness](https://github.com/bitcoin/bips/blob/master/bip-0141.mediawiki#p2wsh)


Here is the script.
Either Alice can redeem the output of the P2WSH after the timelock expiry (after 5 blocks have been mined), or Bob and Alice
can redeem the funds at any time. 
We will run both scenarios.
```javascript
function csvCheckSigOutput(aQ, bQ, sequence) {
  return bitcoin.script.compile([
    bitcoin.opcodes.OP_IF,
    bitcoin.script.number.encode(sequence),
    bitcoin.opcodes.OP_CHECKSEQUENCEVERIFY,
    bitcoin.opcodes.OP_DROP,

    bitcoin.opcodes.OP_ELSE,
    bQ.publicKey,
    bitcoin.opcodes.OP_CHECKSIGVERIFY,
    bitcoin.opcodes.OP_ENDIF,

    aQ.publicKey,
    bitcoin.opcodes.OP_CHECKSIG,
  ])
}
```


## Creating and Funding the P2WSH 

Import libraries, test wallets and set the network and hashType.
```javascript
const bitcoin = require('bitcoinjs-lib')
const { alice, bob } = require('./wallets.json')
const network = bitcoin.networks.regtest
const hashType = bitcoin.Transaction.SIGHASH_ALL
```

We also need an additional library to help us with BIP68 relative timelock encoding.
```javascript
const bip68 = require('bip68')
```

In both scenarios Alice_0 will get back the funds.
```javascript
const keyPairAlice0 = bitcoin.ECPair.fromWIF(alice[0].wif, network)
const p2wpkhAlice0 = bitcoin.payments.p2wpkh({pubkey: keyPairAlice0.publicKey, network})
```

Create a key pair for Bob_0.
```javascript
const keyPairBob0 = bitcoin.ECPair.fromWIF(bob[0].wif, network)
```

Encode the sequence value according to BIP68 specification (now + 5 blocks).
```javascript
const sequence = bip68.encode({blocks: 5})
```

Generate the witnessScript with CSV 5 blocks from now.
> In a P2WSH context, a redeem script is called a witness script.
```javascript
const witnessScript = csvCheckSigOutput(keyPairAlice0, keyPairBob0, sequence)
console.log('witnessScript  ', witnessScript.toString('hex'))
```

You can decode the script in Bitcoin Core CLI with `decodescript`.

Generate the P2WSH.
```javascript
const p2wsh = bitcoin.payments.p2wsh({redeem: {output: witnessScript, network}, network})
console.log('P2WSH address  ', p2wsh.address)
```

Send 1 BTC to this P2WSH address.
> Note that our redeem script doesn't contain any variable data so the P2WSH will always be the same.
```
$ sendtoaddress bcrt1qjnc0eeslkedv2le9q4t4gak98ygtfx69dlfchlurkyw9rauhuy0qgmazhq 1
```

Get the output index so that we have the outpoint (txid / vout).
```
$ getrawtransaction "txid" true
```

The output of our funding transaction has a locking script composed of <version byte> + <32-bytes hash>.
This 32 bytes hash is the SHA256 of our redeem script.
```javascript
bitcoin.crypto.sha256(witnessScript).toString('hex')
```


## Preparing the spending transaction

Now let's prepare the spending transaction by setting input and output, as well as the nSequence value for the first 
scenario.

Create a BitcoinJS transaction builder object.
```javascript
const txb = new bitcoin.TransactionBuilder(network)
```

Create the input by referencing the outpoint of our P2WSH funding transaction.
We add the sequence number only if we want to run the first scenario.
```javascript
// txb.addInput(prevTx, input.vout, input.sequence, prevTxScript)
txb.addInput('TX_ID', TX_VOUT, [sequence])
```

Alice_0 will redeem the fund to her P2WPKH address, leaving 100 000 satoshis for the mining fees.
```javascript
txb.addOutput(p2wpkhAlice0.address, 999e5)
```

Prepare the transaction.
```javascript
const tx = txb.buildIncomplete()
```


## Adding the witness stack

Now we can update the transaction with the witness stack (`txinwitness` field), providing a solution to the locking script.

We generate the hash that will be used to produce the signatures.
> Note that we use a special method `hashForWitnessV0` for Segwit transactions.
```javascript
// hashForWitnessV0(inIndex, prevOutScript, value, hashType)
const signatureHash = tx.hashForWitnessV0(0, witnessScript, 1e8, hashType)
```

There are two ways to redeem the funds, either Alice after the timelock expiry or Alice and Bob at any time.
We control which branch of the script we want to run by ending our unlocking script with a boolean value.

First branch: {Alice's signature} OP_TRUE
```javascript
const witnessStackFirstBranch = bitcoin.payments.p2wsh({
  redeem: {
    input: bitcoin.script.compile([
      bitcoin.script.signature.encode(keyPairAlice0.sign(signatureHash), hashType),
      bitcoin.opcodes.OP_TRUE,
    ]),
    output: witnessScript
  }
}).witness

console.log('First branch witness stack  ', witnessStackFirstBranch.map(x => x.toString('hex')))
```

Second branch: {Alice's signature} {Bob's signature} OP_FALSE
```javascript
const witnessStackSecondBranch = bitcoin.payments.p2wsh({
  redeem: {
    input: bitcoin.script.compile([
      bitcoin.script.signature.encode(keyPairAlice0.sign(signatureHash), hashType),
      bitcoin.script.signature.encode(keyPairBob0.sign(signatureHash), hashType),
      bitcoin.opcodes.OP_FALSE
    ]),
    output: witnessScript
  }
}).witness

console.log('Second branch witness stack  ', witnessStackSecondBranch.map(x => x.toString('hex')))
```

We provide the witness stack that BitcoinJS prepared for us. 
```javascript
tx.setWitness(0, [witnessStackFirstBranch OR witnessStackSecondBranch])
```

Get the raw hex serialization.
> No `build` step here as we have already called `buildIncomplete`
```javascript
console.log('tx.toHex  ', tx.toHex())
```

Inspect the raw transaction with Bitcoin Core CLI, check that everything is correct.
```
$ decoderawtransaction "hexstring"
```


## Broadcasting the transaction

If we run the first scenario we need 5 blocks to be mined so that the timelock will expire.
```
$ generate 5
```

It's time to broadcast the transaction via Bitcoin Core CLI.
```
$ sendrawtransaction "hexstring"
```

Inspect the transaction.
```
$ getrawtransaction "txid" true
```


## Observations

For both scenarios we note that our scriptSig is empty.

For the first scenario, we note that our witness stack contains
  * Alice_0 signature
  * 01, which is equivalent to OP_TRUE
  * the witness script, that we can decode with `decodescript` 
  
For the second scenario, we note that our witness stack contains
  * Alice_0 signature
  * Bob_0 signature
  * an empty string, which is equivalent to OP_FALSE
  * the witness script, that we can decode with `decodescript`
