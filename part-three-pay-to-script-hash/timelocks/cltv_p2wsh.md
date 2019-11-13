# Script with CHECKLOCKTIMEVERIFY - Native Segwit P2WSH

> To follow along this tutorial
>
> * Execute all the transaction code in one go by typing `node code/filename.js`   
> * Or enter the commands step-by-step by `cd` into `./code` then type `node` in a terminal to open the Node.js REPL   
> * Open the Bitcoin Core GUI console or use `bitcoin-cli` for the Bitcoin Core commands
> * Use `bx` aka `Libbitcoin-explorer` as a handy complement

Let's create a native Segwit P2WSH transaction with a script that contains the `OP_CHECKLOCKTIMEVERIFY` absolute timelock opcode.

> Read more about OP\_CHECKLOCKTIMEVERIFY in [BIP65](https://github.com/bitcoin/bips/blob/master/bip-0065.mediawiki) Read more about P2WSH in [BIP141 - Segregated Witness](https://github.com/bitcoin/bips/blob/master/bip-0141.mediawiki#p2wsh)

Either alice\_1 can redeem the funds after the timelock has expired, or bob\_1 and alice\_1 can redeem the funds at any time. We will set the timelock 6 hours in the past. In real life it should be set in the future, but we don't want to wait for the timelock to expire in order to complete the tutorial.

> The `generatetoaddress` command, which produce blocks on demand on regtest, will not move forward the `mediantime`. It sets the `mediantime` to the current local time of your computer.

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

## Creating and Funding the P2WSH

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

Alice\_1 and bob\_1 are the signers.

```javascript
const keyPairAlice1 = bitcoin.ECPair.fromWIF(alice[1].wif, network)
const keyPairBob1 = bitcoin.ECPair.fromWIF(bob[1].wif, network)
```

In both scenarios alice\_1 P2WPKH address will get back the funds.

```javascript
const p2wpkhAlice1 = bitcoin.payments.p2wpkh({pubkey: keyPairAlice1.publicKey, network})
```

Encode the lockTime value according to BIP65 specification \(now - 6 hours\).

> Method argument is a UNIX timestamp.
>
> ```javascript
> const lockTime = bip65.encode({utc: Math.floor(Date.now() / 1000) - (3600 * 6)})
> console.log('Timelock in UNIX timestamp:')
> console.log(lockTime)
> ```

Generate the witnessScript with CLTV.

> In a P2WSH context, a redeem script is called a witness script. If you do it multiple times you will notice that the hex script is never the same, this is because of the changing timestamp.
```javascript
const witnessScript = cltvCheckSigOutput(keyPairAlice1, keyPairBob1, lockTime)
console.log('Witness script:')
console.log(witnessScript.toString('hex'))
```

You can decode the script in Bitcoin Core CLI with `decodescript`.

Generate the P2WSH.

> If you do it multiple times you will notice that the P2WSH address is never the same, this is because of the changing witness script.
```javascript
const p2wsh = bitcoin.payments.p2wsh({redeem: {output: witnessScript, network}, network})
console.log('P2WSH address:')
console.log(p2wsh.address)
```

Send 1 BTC to this P2WSH address.
```shell
sendtoaddress P2WSH_ADDR 1
```

Get the output index so that we have the outpoint \(txid / vout\).
```shell
getrawtransaction TX_ID true
```     
&nbsp;

The output script of our funding transaction is a versioned witness program. It is composed as follow: `<00 version byte>` + `<32-byte hash witness program>`.  
The SHA256 hash of the witness script \(in the witness of the spending tx\) must match the 32-byte witness program \(in prevTxOut\).
```javascript
console.log(bitcoin.crypto.sha256(witnessScript).toString('hex'))
```
or
```shell
bx sha256 WITNESS_SCRIPT
```

## Preparing the spending transaction

Now let's prepare the spending transaction by setting input and output, and the nLockTime value.

Create a BitcoinJS transaction builder object.

```javascript
const txb = new bitcoin.TransactionBuilder(network)
```

We need to set the transaction-level locktime in our redeem transaction in order to spend a CLTV. You can use the same value as in the witnessScript.

> Because CLTV actually uses nLocktime enforcement consensus rules the time is checked indirectly by comparing redeem transaction nLocktime with the CLTV value. nLocktime must be &lt;= present time and &gt;= CLTV timelock
>
> ```javascript
> txb.setLockTime(lockTime)
> ```

Create the input by referencing the outpoint of our P2WSH funding transaction. The input-level nSequence value needs to be change to `0xfffffffe`, which means that nSequence is disabled, nLocktime is enabled and RBF is not signaled.

```javascript
// txb.addInput(prevTx, input.vout, input.sequence, prevTxScript)
txb.addInput('TX_ID', TX_VOUT, 0xfffffffe)
```

Alice\_1 will redeem the fund to her P2WPKH address, leaving 100 000 satoshis for the mining fees.

```javascript
txb.addOutput(p2wpkhAlice1.address, 999e5)
```

Prepare the transaction.
```javascript
const tx = txb.buildIncomplete()
```

## Adding the witness stack

Now we can update the transaction with the witness stack \(`txinwitness` field\), providing a solution to the locking script.

We generate the hash that will be used to produce the signatures.

> Note that we use a special method `hashForWitnessV0` for Segwit transactions.
>
> ```javascript
> // hashForWitnessV0(inIndex, prevOutScript, value, hashType)
> const signatureHash = tx.hashForWitnessV0(0, witnessScript, 1e8, hashType)
> ```

There are two ways to redeem the funds, either alice\_1 after the timelock expiry or alice\_1 and bob\_1 at any time. We control which branch of the script we want to run by ending our unlocking script with a boolean value.

First branch: {Alice's signature} OP\_TRUE

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

console.log('First branch witness stack:')
console.log(witnessStackFirstBranch.map(x => x.toString('hex')))
```

Second branch: {Alice's signature} {Bob's signature} OP\_FALSE

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

console.log('Second branch witness stack:')
console.log(witnessStackSecondBranch.map(x => x.toString('hex')))
```

We provide the witness stack that BitcoinJS prepared for us.
```javascript
tx.setWitness(0, witnessStackFirstBranch || witnessStackSecondBranch)
```

Get the raw hex serialization.

> No `build` step here as we have already called `buildIncomplete`
```javascript
console.log('Transaction hexadecimal:')
console.log(tx.toHex())
```

Inspect the raw transaction with Bitcoin Core CLI, check that everything is correct.
```shell
decoderawtransaction TX_HEX
```

## Broadcasting the transaction

If you are spending the P2WSH as alice\_1 + timelock after expiry, you must have the node's `mediantime` to be higher than the timelock value.

> `mediantime` is the median timestamp of the previous 11 blocks. Check out [_**BIP113**_](https://github.com/bitcoin/bips/blob/master/bip-0113.mediawiki) for more information.

Check the current mediantime

```shell
getblockchaininfo
```

You need to generate some blocks in order to have the node's `mediantime` synchronized with your computer local time.

> It is not possible to give you an exact number. 20 should be enough. Dave\_1 is our miner
>
> ```shell
> generatetoaddress 20 bcrt1qnqud2pjfpkqrnfzxy4kp5g98r8v886wgvs9e7r
> ```

It's now time to broadcast the transaction via Bitcoin Core CLI.
```shell
sendrawtransaction TX_HEX
```

Inspect the transaction.
```shell
getrawtransaction TX_ID true
```

## Observations

For both scenarios we note that our scriptSig is empty.

For the first scenario, we note that our witness stack contains:
* Alice\_1 signature
* 1, which is equivalent to OP\_TRUE
* The witness script, that we can decode with `decodescript` 

For the second scenario, we note that our witness stack contains:
* Alice\_1 signature
* Bob\_1 signature
* An empty string, which is equivalent to OP\_FALSE
* The witness script, that we can decode with `decodescript`

The SHA256 hash of the witness script \(in the witness of the spending tx\) matches the 32-byte witness program \(in prevTxOut\).

## What's Next?

Continue "Part Three: Pay To Script Hash" with [Script with CHECKSEQUENCEVERIFY - Legacy P2SH](csv_p2sh.md).

