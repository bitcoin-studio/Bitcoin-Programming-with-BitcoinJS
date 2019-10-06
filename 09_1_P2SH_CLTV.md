# 9.1: Script with CHECKLOCKTIMEVERIFY - Legacy P2SH

> To follow along this tutorial
> * Execute all the transaction code in one go by typing `node code/filename.js`   
> * Or enter the commands step-by-step by `cd` into `./code` then type `node` in a terminal to open the Node.js REPL   
> * Open the Bitcoin Core GUI console or use `bitcoin-cli` for the Bitcoin Core commands
> * Use `bx` aka `Libbitcoin-explorer` as a handy complement 

Let's create a legacy P2SH transaction with a script that contains the `OP_CHECKLOCKTIMEVERIFY` absolute timelock opcode.
> Read more about OP_CHECKLOCKTIMEVERIFY in [BIP65](https://github.com/bitcoin/bips/blob/master/bip-0065.mediawiki)


Either alice_1 can redeem the funds after the timelock has expired, or bob_1 and alice_1 can redeem the funds at any time. 
We will set the timelock 6 hours in the past. In real life it should be set in the future, but we don't want to wait for the 
timelock to expire in order to complete the tutorial.   
> The `generatetoaddress` command, which produce blocks on demand on regtest, will not move forward the `mediantime`.
> It sets the `mediantime` to the current local time of your computer.

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

Alice_1 and bob_1 are the signers.   
```javascript
const keyPairAlice1 = bitcoin.ECPair.fromWIF(alice[1].wif, network)
const keyPairBob1 = bitcoin.ECPair.fromWIF(bob[1].wif, network)
```

In both scenarios alice_1 P2WPKH address will get back the funds.
```javascript
const p2wpkhAlice1 = bitcoin.payments.p2wpkh({pubkey: keyPairAlice1.publicKey, network})
```


Encode the lockTime value according to BIP65 specification (now - 6 hours).
> Method argument is a UNIX timestamp.
```javascript
const lockTime = bip65.encode({utc: Math.floor(Date.now() / 1000) - (3600 * 6)})
console.log('lockTime  ', lockTime)
```

Generate the redeemScript with CLTV. 
> If you do it multiple times you will notice that the hex script is never the same, this is because of the locktime.
```javascript
const redeemScript = cltvCheckSigOutput(keyPairAlice1, keyPairBob1, lockTime)
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
// txb.addInput(prevTx, vout, sequence, prevTxScript)
txb.addInput('TX_ID', TX_VOUT, 0xfffffffe, null)
```

Alice_1 will redeem the fund to her P2WPKH address, leaving 100 000 satoshis for the mining fees.
```javascript
txb.addOutput(p2wpkhAlice1.address, 999e5)
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
      bitcoin.script.signature.encode(keyPairAlice1.sign(signatureHash), hashType),
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
      bitcoin.script.signature.encode(keyPairAlice1.sign(signatureHash), hashType),
      bitcoin.script.signature.encode(keyPairBob1.sign(signatureHash), hashType),
      bitcoin.opcodes.OP_FALSE
    ]),
    output: redeemScript
  }
}).input
```

Update the transaction with the input script you have chosen.
```javascript
tx.setInputScript(0, inputScriptFirstBranch || inputScriptSecondBranch)
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

If you are spending the P2SH as Alice + timelock after expiry, you must have the node's `mediantime` to be higher than 
the timelock value.
> `mediantime` is the median timestamp of the previous 11 blocks. Check out 
> **_[BIP113](https://github.com/bitcoin/bips/blob/master/bip-0113.mediawiki)_** for more information.

Check the current mediantime 
```
$ getblockchaininfo
```

You need to generate some blocks in order to have the node's `mediantime` synchronized with your computer local time.
> It is not possible to give you an exact number. 20 should be enough.
> Dave_1 is our miner
```
$ generatetoaddress 20 bcrt1qnqud2pjfpkqrnfzxy4kp5g98r8v886wgvs9e7r
```

It's now time to broadcast the transaction via Bitcoin Core CLI.
```
$ sendrawtransaction "hexstring"
```

Inspect the transaction.
```
$ getrawtransaction "txid" true
```


## Observations

For the first scenario, we note that our scriptSig contains
  * Alice_1 signature
  * 1, which is equivalent to OP_TRUE
  * the redeem script, that we can decode with `decodescript` 
  
For the second scenario, we note that our scriptSig contains
  * Alice_1 signature
  * Bob_1 signature
  * 0, which is equivalent to OP_FALSE
  * the redeem script, that we can decode with `decodescript`


## What's Next?

Continue "PART THREE: PAY TO SCRIPT HASH" with [9.2: Script with CHECKLOCKTIMEVERIFY - Native Segwit P2WSH](09_2_P2WSH_CLTV.md).
