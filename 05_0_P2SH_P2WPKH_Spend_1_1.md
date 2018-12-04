# 5.0: Spend a Embedded Segwit P2SH-P2WPKH UTXO

> To follow along this tutorial and enter the commands step-by-step
> * Type `node` in a terminal after `cd` into `./code` for a Javascript prompt
> * Open the Bitcoin Core GUI console or use `bitcoin-cli` for the Bitcoin Core commands
> * Use `bx` aka `Libbitcoin-explorer` as a handy complement 

Let's spend a P2SH-P2WPKH output (embedded Segwit) and create a new P2WPKH output.
Working with P2SH now is a bit premature as we are dedicated this topic to part three of this guide.
Nevertheless, the purpose of a P2SH-P2WPKH transaction is to pay to a Segwit public key hash, inside a legacy P2SH only 
for backward compatibility. 


## Create a UTXO to spend from
 
Import libraries, test wallets and set the network
```javascript
const bitcoin = require('bitcoinjs-lib')
const { alice, bob } = require('./wallets.json')
const network = bitcoin.networks.regtest
```

Send 1 BTC to Alice_0 embedded Segwit P2SH-P2WPKH address in order to create a P2SH-P2WPKH UTXO (which is in fact a regular P2SH UTXO).
> Check out **_[02_0: Generating and Importing Wallets](02_0_Generating_and_Importing_Wallets.md)_** and your `wallets.json`
> file in the `code` directory. Replace the address if necessary.
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

Create a bitcoinJS key pair object for the spender Alice_0.
Create a P2WPKH payment address and pass it to the P2SH payment method.
```javascript
const keyPairAlice0 = bitcoin.ECPair.fromWIF(alice[0].wif, network)
const p2wpkhAlice0 = bitcoin.payments.p2wpkh({pubkey: keyPairAlice0.publicKey, network})
const p2shAlice0 = bitcoin.payments.p2sh({redeem: p2wpkhAlice0, network})
```

Create a key pair object and a P2PKH address for the recipient Bob_0.
```javascript
const keyPairBob0 = bitcoin.ECPair.fromWIF(bob[0].wif, network)
const p2wpkhBob0 = bitcoin.payments.p2wpkh({pubkey: keyPairBob0.publicKey, network})
```

Create a BitcoinJS transaction builder object.
```javascript
const txb = new bitcoin.TransactionBuilder(network)
```

```javascript
txb.addInput('TX_ID', TX_VOUT)
txb.addOutput(p2wpkhBob0.address, 999e5)
```

The redeem script is composed of a `0` version byte and a 20 bytes witness program, HASH160 of Alice_0 public key.
It is the same as the prevOutScript `p2wpkhAlice0.output` in [4.1: Spend a Native Segwit P2WPKH UTXO](04_1_P2WPKH_Spend_1_1.md).
```javascript
// txb.sign(index, keyPair, redeemScript, sign.hashType, value, witnessScript)
txb.sign(0, keyPairAlice0, p2shAlice0.redeem.output, null, 1e8)
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

In the vin section the scriptSig is the prevOutScript. When passed through HASH160 it should match the hash contained 
in the `scripthash` UTXO that we are spending. 
The Alice_0 public key and signature in `txinwitness` are then verified, like a P2WPKH (<signature> <pubkey> CHECKSIG).

In the vout section we have one `witness_v0_keyhash` UTXO. 


## What's Next?

Continue "PART TWO: PAY TO PUBLIC KEY HASH" with [6.0: Embedding Data With OP_RETURN](06_0_Embedding_Data_OP_RETURN.md).
