# 9.1: Script with CHECKLOCKTIMEVERIFY - Legacy P2SH

> To follow along this tutorial and enter the commands step-by-step
> * Type `node` in a terminal after `cd` into `./code` for a Javascript prompt
> * Open the Bitcoin Core GUI console or use `bitcoin-cli` for the Bitcoin Core commands
> * Use `bx` aka `Libbitcoin-explorer` as a handy complement 

Let's create a legacy P2SH transaction with a script that contains the `OP_CHECKLOCKTIMEVERIFY` absolute timelock opcode.

> Read more about OP_CHECKLOCKTIMEVERIFY in [BIP65](https://github.com/bitcoin/bips/blob/master/bip-0065.mediawiki)

Here is the script.
Either Alice can redeem the output of the P2SH after the timelock expiry (set 6 hours in the past), or Bob and Alice
can redeem the funds at any time. 
We will run both scenarios.
```javascript
function cltvCheckSigOutput (aQ, bQ, lockTime) {
  return bitcoin.script.compile([
    bitcoin.opcodes.OP_IF,
    bitcoin.script.number.encode(lockTime),
    bitcoin.opcodes.OP_CHECKLOCKTIMEVERIFY,
    bitcoin.opcodes.OP_DROP,

    bitcoin.opcodes.OP_ELSE,
    bQ.publicKey,
    bitcoin.opcodes.OP_CHECKSIGVERIFY,
    bitcoin.opcodes.OP_ENDIF,

    aQ.publicKey,
    bitcoin.opcodes.OP_CHECKSIG
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

We also need an additional library to help us with BIP65 absolute timelock encoding.
```javascript
const bip65 = require('bip65')
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

Encode the lockTime value according to BIP65 specification (now - 6 hours).
```javascript
const lockTime = bip65.encode({utc: Math.floor(Date.now() / 1000) - (3600 * 6)})
console.log('lockTime  ', lockTime)
```

Generate the redeemScript with CLTV. 
> If you do it multiple times you will notice that the hex script is never the same, this is because of the timestamp.
```javascript
const redeemScript = cltvCheckSigOutput(keyPairAlice0, keyPairBob0, lockTime)
console.log('redeemScript  ', redeemScript.toString('hex'))
```

You can decode the script in Bitcoin Core CLI with `decodescript`.

Generate the P2SH.
> If you do it multiple times you will notice that the P2SH address is never the same, this is because of redeemScript.
```javascript
const p2sh = bitcoin.payments.p2sh({redeem: {output: redeemScript, network}, network})
console.log('P2SH address  ', p2sh.address)
```

Send 1 BTC to this P2SH address.
```
$ sendtoaddress [p2sh.address] 1
```

Get the output index so that we have the outpoint (txid / vout).
> Find the output index (or vout) under `details > vout`.
```
$ gettransaction "txid"
```


## Preparing the spending transaction

Now let's prepare the spending transaction by setting input and output, and the nLockTime value.

Create a BitcoinJS transaction builder object.
```javascript
const txb = new bitcoin.TransactionBuilder(network)
```

We need to set the transaction-level locktime in our redeem transaction in order to spend a CLTV.
You can use the same value as in the redeemScript.
> Because CLTV actually uses nLocktime enforcement consensus rules 
> the time is checked indirectly by comparing redeem transaction nLocktime with the CLTV value.
> nLocktime must be <= present time and >= CLTV timelock
```javascript
txb.setLockTime(lockTime)
```

Create the input by referencing the outpoint of our P2SH funding transaction.
The input-level nSequence value needs to be change to `0xfffffffe`, which means that nSequence is disabled, nLocktime is 
enabled and RBF is not signaled.
```javascript
// txb.addInput(prevTx, input.vout, input.sequence, prevTxScript)
txb.addInput('TX_ID', TX_VOUT, 0xfffffffe)
```

Alice_0 will redeem the fund to her P2WPKH address, leaving 100 000 satoshis for the mining fees.
```javascript
txb.addOutput(p2wpkhAlice0.address, 999e5)
```

Prepare the transaction.
```javascript
const tx = txb.buildIncomplete()
```


## Creating the unlocking script

Now we can update the transaction with the unlocking script, providing a solution to the locking script.

We generate the hash that will be used to produce the signatures.
```javascript
const signatureHash = tx.hashForSignature(0, redeemScript, hashType)
```

There are two ways to redeem the funds, either Alice after the timelock expiry or Alice and Bob at any time.
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
  }
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
tx.setInputScript(0, [inputScriptFirstBranch or inputScriptSecondBranch])
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

> Beware of the `mediantime` of our node to be more than the timelock value.
> ```
> $ getblockchaininfo
> ```
> On regtest the mediantime is quite unpredictable. 
> So you just need to generate enough blocks, can't tell you how many. 
> ```
> $ generate 10
> ```

It's time to broadcast the transaction via Bitcoin Core CLI.
```
$ sendrawtransaction "hexstring"
```

Inspect the transaction.
```
$ getrawtransaction "txid" true
```


## Observations

For the first scenario, we note that our scriptSig contains
  * Alice_0 signature
  * 1, which is equivalent to OP_TRUE
  * the redeem script, that we can decode with `decodescript` 
  
For the second scenario, we note that our scriptSig contains
  * Alice_0 signature
  * Bob_0 signature
  * 0, which is equivalent to OP_FALSE
  * the redeem script, that we can decode with `decodescript`
