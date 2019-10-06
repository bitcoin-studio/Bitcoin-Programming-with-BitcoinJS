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


Either alice_1 can spend the P2WSH UTXO but only when 5 blocks have been mined after the funding transaction is first confirmed, 
or bob_1 and alice_1 can redeem the funds at any time.
```javascript
function csvCheckSigOutput(aQ, bQ, timelock) {
  return bitcoin.script.compile([
    bitcoin.opcodes.OP_IF,
    bitcoin.script.number.encode(timelock),
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

Alice_1 and bob_1 are the signers.
```javascript
const keyPairAlice1 = bitcoin.ECPair.fromWIF(alice[1].wif, network)
const keyPairBob1 = bitcoin.ECPair.fromWIF(bob[1].wif, network)
```

In both scenarios alice_1 P2WPKH address will get back the funds.
```javascript
const p2wpkhAlice1 = bitcoin.payments.p2wpkh({pubkey: keyPairAlice1.publicKey, network})
```

Set the relative timelock to 5 blocks (to be mined on top of the funding transaction confirmation).
> We encode the sequence value according to BIP68 specification.
```javascript
const timelock = bip68.encode({blocks: 5})
```

Generate the witnessScript with CSV 5 blocks from now.
> In a P2WSH context, a redeem script is called a witness script.
```javascript
const witnessScript = csvCheckSigOutput(keyPairAlice1, keyPairBob1, timelock)
console.log('witnessScript  ', witnessScript.toString('hex'))
```

You can decode the script in Bitcoin Core CLI with `decodescript`.

Generate the P2WSH address.
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

The output script of our funding transaction is a versioned witness program. 
It is composed as follow: <00 version byte> + <32-byte hash witness program>.   
The SHA256 hash of the witness script (in the witness of the spending tx) must match the 32-byte witness program (in prevTxOut).
```javascript
bitcoin.crypto.sha256(witnessScript).toString('hex')
```
or
```
$ bx sha256 <witnessScript>
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
// txb.addInput(prevTx, vout, sequence, prevTxScript)
txb.addInput('TX_ID', TX_VOUT, [sequence])
```

Alice_1 will redeem the fund to her P2WPKH address, leaving 100 000 satoshis for the mining fees.
```javascript
txb.addOutput(p2wpkhAlice1.address, 999e5)
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

There are two ways to redeem the funds, either alice_1 after the timelock expiry or alice_1 and bob_1 at any time.
We control which branch of the script we want to run by ending our unlocking script with a boolean value.

First branch: {Alice's signature} OP_TRUE
```javascript
const witnessStackFirstBranch = bitcoin.payments.p2wsh({
  redeem: {
    input: bitcoin.script.compile([
      bitcoin.script.signature.encode(keyPairAlice1.sign(signatureHash), hashType),
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
      bitcoin.script.signature.encode(keyPairAlice1.sign(signatureHash), hashType),
      bitcoin.script.signature.encode(keyPairBob1.sign(signatureHash), hashType),
      bitcoin.opcodes.OP_FALSE
    ]),
    output: witnessScript
  }
}).witness

console.log('Second branch witness stack  ', witnessStackSecondBranch.map(x => x.toString('hex')))
```

We provide the witness stack that BitcoinJS prepared for us. 
```javascript
tx.setWitness(0, witnessStackFirstBranch || witnessStackSecondBranch)
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
$ generatetoaddress 5 bcrt1qnqud2pjfpkqrnfzxy4kp5g98r8v886wgvs9e7r
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
  * Alice_1 signature
  * 01, which is equivalent to OP_TRUE
  * the witness script, that we can decode with `decodescript` 
  
For the second scenario, we note that our witness stack contains
  * Alice_1 signature
  * Bob_1 signature
  * an empty string, which is equivalent to OP_FALSE
  * the witness script, that we can decode with `decodescript`
