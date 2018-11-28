# 4.1: Spend a Native Segwit P2WPKH UTXO

> To follow along this tutorial and enter the commands step-by-step
> * Type `node` in a terminal after `cd` into `./code` for a Javascript prompt
> * Open the Bitcoin Core GUI console or use `bitcoin-cli` for the Bitcoin Core commands
> * Use `bx` aka `Libbitcoin-explorer` as a handy complement 


Let's spend a native Segregated Witness P2WPKH output and create a new legacy P2PKH output.


## Create a UTXO to spend from
 
Import libraries, test wallets and set the network
```javascript
const bitcoin = require('bitcoinjs-lib')
const { alice, bob } = require('./wallets.json')
const network = bitcoin.networks.regtest
```

Send 1 BTC to Alice_0 native Segwit P2WPKH address in order to create a P2WPKH UTXO.
> Check out **_[02_0: Generating and Importing Wallets](02_0_Generating_and_Importing_Wallets.md)_** and your `wallets.json`
> file in the `code` directory. Replace the address if necessary.
```
$ sendtoaddress bcrt1qlwyzpu67l7s9gwv4gzuv4psypkxa4fx4ggs05g 1
```

Get the output index so that we have the outpoint (txid / vout).
> Find the output index (or vout) under `details > vout`.
```
$ gettransaction "txid"
```


## Creating the transaction

Now let's spend the UTXO with BitcoinJS.

Create a bitcoinJS key pair object for Alice_0, the spender of our new UTXO, and the only one capable of spending it. 
```javascript
const keyPairAlice0 = bitcoin.ECPair.fromWIF(alice[0].wif, network)
const p2wpkhAlice0 = bitcoin.payments.p2wpkh({pubkey: keyPairAlice0.publicKey, network})
```

Create a key pair object and a P2PKH address for the recipient Bob_0.
```javascript
const keyPairBob0 = bitcoin.ECPair.fromWIF(bob[0].wif, network)
const p2pkhBob0 = bitcoin.payments.p2pkh({pubkey: keyPairBob0.publicKey, network})
```

Create a BitcoinJS transaction builder object.
```javascript
const txb = new bitcoin.TransactionBuilder(network)
```

Create the input by providing the outpoint but also the script of the previous transaction (vout > scriptPubKey > hex).
Adding the prevTxScript is a specificity of P2WPKH spending.
> The script is composed as follow: <version program 00> PUSHBYTES_14 <witness program>
> The HASH160 of the public key must match the 20-bytes witness program.
> `$ bx bitcoin160 03745c9aceb84dcdeddf2c3cdc1edb0b0b5af2f9bf85612d73fa6394758eaee35d`
> fb8820f35effa054399540b8ca86040d8ddaa4d5
> or with bitcoinJS
> bitcoin.crypto.hash160(Buffer.from('03745c9aceb84dcdeddf2c3cdc1edb0b0b5af2f9bf85612d73fa6394758eaee35d', 'hex')).toString('hex')
```javascript
// txb.addInput(prevTx, input.vout, input.sequence, prevTxScript)
txb.addInput('TX_ID', TX_VOUT, null, p2wpkhAlice0.output) 
```

Pay 0.999 BTC to Bob_0 public key hash
```javascript
txb.addOutput(p2pkhBob0.address, 999e5)
```

> The miner fee is calculated by subtracting the outputs from the inputs.
> 100 000 000 - 99 900 000 = 100 000
> 100 000 satoshis equals 0,001 BTC, this is the miner fee.

No redeem script needed because we are spending a native segwit UTXO, not a P2SH-P2WPKH.
But we need to sign the input value.
```javascript
// txb.sign(index, keyPair, redeemScript, sign.hashType, value, witnessScript)
txb.sign(0, keyPairAlice0, null, null, 1e8)
```

Finally we can build the transaction and get the raw hex serialization.
```javascript
const tx = txb.build()
console.log('tx.toHex()  ', tx.toHex())
```

Inspect the raw transaction with Bitcoin Core CLI, check that everything is correct.
```
$ decoderawtransaction "hexstring"
```


## Broadcasting the transaction

It's time to broadcast the transaction via Bitcoin Core CLI.
```
$ sendrawtransaction "hexstring"
```

`sendrawtransaction` returns the transaction ID, with which you can inspect your transaction again.
> Don't forget the second argument. If false, it returns the hex string, otherwise it returns a detailed json object.
```
$ getrawtransaction "txid" true
```


## Observations

In the vin section we note that `scriptSig` is empty and that we have an additional `txinwitness` field which contains 
Alice signature and public key.

In the vout section we have one `witness_v0_keyhash` output, which is the code name for native Segwit.
