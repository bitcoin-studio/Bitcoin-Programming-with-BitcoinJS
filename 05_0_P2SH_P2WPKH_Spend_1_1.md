# 5.0: Spend a Embedded Segwit P2SH-P2WPKH UTXO

> To follow along this tutorial
> * Execute all the transaction code in one go by typing `node code/filename.js`   
> * Or enter the commands step-by-step by `cd` into `./code` then type `node` in a terminal to open the Node.js REPL   
> * Open the Bitcoin Core GUI console or use `bitcoin-cli` for the Bitcoin Core commands
> * Use `bx` aka `Libbitcoin-explorer` as a handy complement 

Let's spend a P2SH-P2WPKH output (embedded Segwit) and create a new P2WPKH output.
Working with P2SH now is a bit premature as we are dedicated this topic to part three of this guide.
Nevertheless, the purpose of a P2SH-P2WPKH transaction is to pay to a Segwit public key hash, inside a legacy P2SH. 
This type of transaction is less optimal than native Segwit but useful for backward compatibility. 


## Create a UTXO to spend from
 
Import libraries, test wallets and set the network
```javascript
const bitcoin = require('bitcoinjs-lib')
const { alice, bob } = require('./wallets.json')
const network = bitcoin.networks.regtest
```

Send 1 BTC to alice_1 embedded Segwit P2SH-P2WPKH address in order to create a P2SH-P2WPKH UTXO (which is in fact a regular P2SH UTXO).
> Check out the address in your `wallets.json` file in the `code` directory. Replace the address if necessary.
```
$ sendtoaddress 2MzFvFvnhFskGnVQpUr1ZPr4wYWLwf211s6 1
```

Inspect the transaction. 
```
$ getrawtransaction "txid" true
```

Get the output index so that we have the outpoint (txid / vout).
> Find the output index (or vout) under `details > vout`.

You can note that the UTXO is of type `scripthash`, which means that it is a P2SH UTXO.
> Read more about P2SH here
> * https://bitcoin.org/en/developer-guide#p2sh-scripts
> * https://en.bitcoin.it/wiki/Pay_to_script_hash
> * https://github.com/bitcoin/bips/blob/master/bip-0016.mediawiki 


## Creating the transaction

Now let's spend the P2SH-P2WPKH UTXO with BitcoinJS.

Create a bitcoinJS key pair object for the spender alice_1.
Create a P2WPKH payment address and pass it to the P2SH payment method.
```javascript
const keyPairAlice1 = bitcoin.ECPair.fromWIF(alice[1].wif, network)
const p2wpkhAlice1 = bitcoin.payments.p2wpkh({pubkey: keyPairAlice1.publicKey, network})
const p2shAlice1 = bitcoin.payments.p2sh({redeem: p2wpkhAlice1, network})
```

Create a key pair object and a P2PKH address for the recipient bob_1.
```javascript
const keyPairBob1 = bitcoin.ECPair.fromWIF(bob[1].wif, network)
const p2wpkhBob1 = bitcoin.payments.p2wpkh({pubkey: keyPairBob1.publicKey, network})
```

Create a BitcoinJS transaction builder object.
```javascript
const txb = new bitcoin.TransactionBuilder(network)
```

```javascript
txb.addInput('TX_ID', TX_VOUT)
txb.addOutput(p2wpkhBob1.address, 999e5)
```

The redeem script is composed of a `0` version byte and a 20 bytes witness program, HASH160 of alice_1 public key.
It is the same as the previous output script `p2wpkhAlice1.output` that we pass to `txb.addInput()` in [4.1: Spend a Native Segwit P2WPKH UTXO](04_1_P2WPKH_Spend_1_1.md).
```javascript
// txb.sign(index, keyPair, redeemScript, sign.hashType, value, witnessScript)
txb.sign(0, keyPairAlice1, p2shAlice1.redeem.output, null, 1e8, null)
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

In the vin section the scriptSig is the redeem script <00> <PUSHBYTES_14> <alice_1 pubKeyHash>. 
When passed through HASH160 it should match the hash contained in the script of the `scripthash` UTXO that we are spending. 
```
$ bx bitcoin 160 0014fb8820f35effa054399540b8ca86040d8ddaa4d5
4cea7ef76a4423240d5f06d96868726f57bd7d30
```

The alice_1 public key and signature in `txinwitness` are then verified, like a P2WPKH (<signature> <pubkey> CHECKSIG).

In the vout section we have one `witness_v0_keyhash` UTXO. 


## What's Next?

Continue "PART TWO: PAY TO PUBLIC KEY HASH" with [6.0: Embedding Data With OP_RETURN](06_0_Embedding_Data_OP_RETURN.md).
