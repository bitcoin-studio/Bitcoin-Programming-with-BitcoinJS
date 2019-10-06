# 9.3: Script with CHECKSEQUENCEVERIFY - Legacy P2SH

> To follow along this tutorial
> * Execute all the transaction code in one go by typing `node code/filename.js`   
> * Or enter the commands step-by-step by `cd` into `./code` then type `node` in a terminal to open the Node.js REPL   
> * Open the Bitcoin Core GUI console or use `bitcoin-cli` for the Bitcoin Core commands
> * Use `bx` aka `Libbitcoin-explorer` as a handy complement 

Let's create a legacy P2SH transaction with a script that contains the `OP_CHECKSEQUENCEVERIFY` relative timelock opcode.
The script is almost the same as **_[9.1: Script with CHECKLOCKTIMEVERIFY - Legacy P2SH](09_1_P2SH_CLTV.md)_** but with 
a relative timelock of 5 blocks.

> To read more about OP_CHECKSEQUENCEVERIFY 
>   * [BIP112 - CHECKSEQUENCEVERIFY](https://github.com/bitcoin/bips/blob/master/bip-0112.mediawiki)
>   * [BIP68 - Relative lock-time using consensus-enforced sequence numbers](https://github.com/bitcoin/bips/blob/master/bip-0068.mediawiki)


Either alice_1 can spend the P2SH UTXO but only when 5 blocks have been mined after the funding transaction is first confirmed, 
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

Generate the redeem script.
```javascript
const redeemScript = csvCheckSigOutput(keyPairAlice1, keyPairBob1, timelock)
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
// txb.addInput(prevTx, vout, sequence, prevTxScript)
txb.addInput('TX_ID', TX_VOUT, [sequence])
```

Alice_1 will redeem the fund to her P2WPKH address, leaving 100 000 sats for the mining fees.
```javascript
txb.addOutput(p2wpkhAlice1.address, 999e5)
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

There are two ways the redeem the funds, alice_1 after the timelock expiry or alice_1 and bob_1 at any time.
We control which branch of the script we want to run by ending our unlocking script with a boolean value.

First branch: {Alice's signature} OP_TRUE
```javascript
const inputScriptFirstBranch = bitcoin.payments.p2sh({
  redeem: {
    input: bitcoin.script.compile([
      bitcoin.script.signature.encode(keyPairAlice1.sign(signatureHash), hashType),
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
      bitcoin.script.signature.encode(keyPairAlice1.sign(signatureHash), hashType),
      bitcoin.script.signature.encode(keyPairBob1.sign(signatureHash), hashType),
      bitcoin.opcodes.OP_FALSE
    ]),
    output: redeemScript
  }
}).input
```

Update the transaction with the unlocking script.
```javascript
tx.setInputScript(0, inputScriptFirstBranch || inputScriptSecondBranch)
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

On the first scenario, we note that the input sequence field is 5 and that our scriptSig contains
  * Alice_1 signature
  * 1, which is equivalent to OP_TRUE
  * the redeem script, that we can decode with `decodescript`   
  
On the second scenario, we note that our scriptSig contains
  * Alice_1 signature
  * Bob_1 signature
  * 0, which is equivalent to OP_FALSE
  * the redeem script, that we can decode with `decodescript`


## What's Next?

Continue "PART THREE: PAY TO SCRIPT HASH" with [9.4: Script with CHECKSEQUENCEVERIFY - Native Segwit P2WSH](09_4_P2WSH_CSV.md).
