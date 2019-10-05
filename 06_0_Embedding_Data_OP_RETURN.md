# 6.0: Embedding Data with OP_RETURN

> To follow along this tutorial
> * Execute all the transaction code in one go by typing `node code/filename.js`   
> * Or enter the commands step-by-step by `cd` into `./code` then type `node` in a terminal to open the Node.js REPL   
> * Open the Bitcoin Core GUI console or use `bitcoin-cli` for the Bitcoin Core commands
> * Use `bx` aka `Libbitcoin-explorer` as a handy complement 

Let's store for eternity some data on the Bitcoin blockchain using the special OP_RETURN opcode. 
It will create a special `nulldata` output type. 

An output using an OP_RETURN is provably unspendable, so we don't need to lock any BTC in this UTXO.
However, we still need to pay the miner fees, so we will spend BTC from a previous P2WPKH UTXO, create one `nulldata` UTXO 
and an other one for the change, leaving the difference as mining fees. 

> For more information about OP_RETURN check out: 
> * [Bitcoin Developer Guide - Nulldata Output Type](https://bitcoin.org/en/developer-guide#null-data)
> * [An analysis of Bitcoin OP RETURN metadata](https://arxiv.org/pdf/1702.01024.pdf)


## Create a UTXO to spend from
 
Let's create a P2WPKH UTXO to spend from.
 
Import libraries, test wallet and set the network.
```javascript
const bitcoin = require('bitcoinjs-lib')
const { alice } = require('./wallets.json')
const network = bitcoin.networks.regtest
```

Send 1 BTC to Alice_0 P2WPKH address via Bitcoin Core CLI.
```
$ sendtoaddress bcrt1qlwyzpu67l7s9gwv4gzuv4psypkxa4fx4ggs05g 1
```

Get the output index so that we have the outpoint (txid / vout).
> Find the output index (or vout) under `details > vout`.
```
$ gettransaction "txid"
```


## Creating the transaction

Now let's create our OP_RETURN P2PKH UTXO.

Create a bitcoinJS key pair object for the spender alice_1 and a P2WPKH address that we will use for the change.
```javascript
const keyPairAlice1 = bitcoin.ECPair.fromWIF(alice[1].wif, network)
const p2wpkhAlice1 = bitcoin.payments.p2wpkh({pubkey: keyPairAlice1.publicKey, network})
```

Create a BitcoinJS transaction builder object.
```javascript
const txb = new bitcoin.TransactionBuilder(network)
```

Fill in the outpoint.
Don't forget the prevTxScript, necessary because we are spending a P2WPKH.
```javascript
// txb.addInput(prevTx, input.vout, input.sequence, prevTxScript)
txb.addInput('TX_ID', TX_VOUT, null, p2wpkhAlice1.output)
```

Create an OP_RETURN output with BitcoinJS `embed` payment method.
Create a second output to get back the change. 100 000 000 - 100 000(fees) = 99 900 000 sats
> An output using an OP_RETURN is provably unspendable. For this reason, the value of an OP_RETURN output 
> is usually set to 0.
```javascript
const data = Buffer.from('Programmable money FTW!', 'utf8')
const embed = bitcoin.payments.embed({data: [data]})
txb.addOutput(embed.output, 0)
txb.addOutput(p2wpkhAlice1.address, 99900000)
```

Don't forget the bitcoin value of the UTXO we are spending, necessary because we are spending a P2WPKH.
```javascript
// txb.sign(index, keyPair, redeemScript, sign.hashType, value, witnessScript)
txb.sign(0, keyPairAlice1, null, null, 1e8, null)
```

Finally we can build the transaction and get the raw hex serialization.
```javascript
const tx = txb.build()
console.log('tx.toHex()', tx.toHex())
```

Inspect the raw transaction with Bitcoin Core CLI, check that everything is correct.
```
$ decoderawtransaction "hexstring"
```


## Broadcasting the transaction

It's time to broadcast the transaction. 
```
$ sendrawtransaction "hexstring"
```

Inspect the transaction.
```
$ getrawtransaction "txid" true
```


## Observations

We note that the OP_RETURN UTXO is marked with the special type `nulldata`.

To decode the OP_RETURN data we can use the `xxd` library in a terminal which make a hexdump or the reverse.
```
$ echo 50726f6772616d6d61626c65206d6f6e65792046545721 | xxd -p -r
```


## What's Next?

Advance through "PART THREE: PAY TO SCRIPT HASH" with [7.0: Bitcoin Script Puzzles or Pay to Script Hash](07_0_Bitcoin_Script_Puzzles.md).
