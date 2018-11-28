# 9.3: Script with CHECKSEQUENCEVERIFY - Legacy P2SH

> To follow along this tutorial and enter the commands step-by-step
> * Type `node` in a terminal after `cd` into `./code` for a Javascript prompt
> * Open the Bitcoin Core GUI console or use `bitcoin-cli` for the Bitcoin Core commands
> * Use `bx` aka `Libbitcoin-explorer` as a handy complement 

Let's create a legacy P2SH transaction with a script that contains the `OP_CHECKSEQUENCEVERIFY` relative timelock opcode.
The script is almost the same as **_10.1: Script with CHECKLOCKTIMEVERIFY - Legacy P2SH_** but with a relative timelock 
of 5 blocks.

> To read more about OP_CHECKSEQUENCEVERIFY 
>   * [BIP112 - CHECKSEQUENCEVERIFY](https://github.com/bitcoin/bips/blob/master/bip-0112.mediawiki)
>   * [BIP68 - Relative lock-time using consensus-enforced sequence numbers](https://github.com/bitcoin/bips/blob/master/bip-0068.mediawiki)

Here is the script.
Either Alice can redeem the output of the P2SH after the timelock expiry (after 5 blocks have been mined), or Bob and Alice
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


## Creating and Funding the P2SH 

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

Generate the redeemScript with CSV 5 blocks from now.
```javascript
const redeemScript = csvCheckSigOutput(keyPairAlice0, keyPairBob0, sequence)
console.log('redeemScript  ', redeemScript.toString('hex'))
```

Generate the P2SH.
```javascript
const p2sh = bitcoin.payments.p2sh({redeem: {output: redeemScript, network}, network})
console.log('p2sh.address  ', p2sh.address)
```

Send 1 BTC to this P2SH address.
> Note that our redeem script doesn't contain any variable data so the P2WSH will always be the same.
```
$ sendtoaddress 2Mw8mn5xQWk8Pz2KNXLnjSvS6TemKVELLyy 1
```

Get the output index so that we have the outpoint (txid / vout).
> Find the output index (or vout) under `details > vout`.
```
$ gettransaction "txid"
```


## Preparing the spending transaction

Now let's prepare the spending transaction by setting input and output, as well as the nSequence value for the first 
scenario.

Create a BitcoinJS transaction builder object.
```javascript
const txb = new bitcoin.TransactionBuilder(network)
```

Create the input by referencing the outpoint of our P2SH funding transaction.
We add the sequence number only if we want to run the first scenario.
```javascript
// txb.addInput(prevTx, input.vout, input.sequence, prevTxScript)
txb.addInput('TX_ID', TX_VOUT, [sequence])
```

Alice_0 will redeem the fund to her P2WPKH address, leaving 100 000 sats for the mining fees.
```javascript
txb.addOutput(p2wpkhAlice0.address, 999e5)
```

Prepare the transaction.
```javascript
const tx = txb.buildIncomplete()
```


## Creating the unlocking script

We generate the hash that will be used to produce the signatures.
```javascript
const signatureHash = tx.hashForSignature(0, redeemScript, hashType)
```

There are two ways the redeem the funds, Alice after the timelock expiry or Alice and Bob at any time.
We control which branch of the script we want to run by ending our unlocking script with a boolean value.

First branch: {Alice's signature} OP_TRUE
```javascript
const inputScriptFirstBranch = bitcoin.payments.p2sh({
  redeem: {
    input: bitcoin.script.compile([
      bitcoin.script.signature.encode(keyPairAlice0.sign(signatureHash), hashType),
      bitcoin.opcodes.OP_TRUE,
    ]),
    output: redeemScript
  },
}).input
```

Second branch: {Alice's signature} {Bob's signature} OP_FALSE
```javascript
const inputScriptSecondBranch = bitcoin.payments.p2sh({
  redeem: {
    input: bitcoin.script.compile([
      bitcoin.script.signature.encode(keyPairAlice0.sign(signatureHash), hashType),
      bitcoin.script.signature.encode(keyPairBob0.sign(signatureHash), hashType),
      bitcoin.opcodes.OP_FALSE
    ]),
    output: redeemScript
  }
}).input
```

Update the transaction with the unlocking script.
```javascript
tx.setInputScript(0, [inputScriptFirstBranch OR inputScriptSecondBranch])
```

Get the raw hex serialization.
> No `build` step here as we have already called `buildIncomplete`.
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

On the first scenario, we note that the input sequence field is 5 and that our scriptSig contains
  * Alice_0 signature
  * 1, which is equivalent to OP_TRUE
  * the redeem script, that we can decode with `decodescript`   
  
On the second scenario, we note that our scriptSig contains
  * Alice_0 signature
  * Bob_0 signature
  * 0, which is equivalent to OP_FALSE
  * the redeem script, that we can decode with `decodescript`
