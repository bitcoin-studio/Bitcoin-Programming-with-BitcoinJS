# 4.1: Spend a Native Segwit P2WPKH UTXO

> To follow along this tutorial
> * Execute all the transaction code in one go by typing `node code/filename.js`   
> * Or enter the commands step-by-step by `cd` into `./code` then type `node` in a terminal to open the Node.js REPL   
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

Send 1 BTC to alice_1 native Segwit P2WPKH address in order to create a P2WPKH UTXO.
> Check out the address in your `wallets.json` file in the `code` directory. Replace the address if necessary.
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

Create a bitcoinJS keypair object for alice_1, the spender of our new UTXO, and the only one capable of spending it. 
```javascript
const keyPairAlice1 = bitcoin.ECPair.fromWIF(alice[1].wif, network)
const p2wpkhAlice1 = bitcoin.payments.p2wpkh({pubkey: keyPairAlice1.publicKey, network})
```

Create a key pair object and a P2PKH address for the recipient bob_1.
```javascript
const keyPairBob1 = bitcoin.ECPair.fromWIF(bob[1].wif, network)
const p2pkhBob1 = bitcoin.payments.p2pkh({pubkey: keyPairBob1.publicKey, network})
```

Create a BitcoinJS transaction builder object.
```javascript
const txb = new bitcoin.TransactionBuilder(network)
```

Create the input by providing the outpoint but also the script of the previous transaction (vout > scriptPubKey > hex).
Adding the prevTxScript is a specificity of P2WPKH spending.
> The script is composed as follow: <version program 00> PUSHBYTES_14 <witness program>
> The HASH160 of the public key must match the 20-bytes witness program. <br/>
> `$ bx bitcoin160 03745c9aceb84dcdeddf2c3cdc1edb0b0b5af2f9bf85612d73fa6394758eaee35d` <br/>
> fb8820f35effa054399540b8ca86040d8ddaa4d5 <br/>
> or with bitcoinJS
> bitcoin.crypto.hash160(Buffer.from('03745c9aceb84dcdeddf2c3cdc1edb0b0b5af2f9bf85612d73fa6394758eaee35d', 'hex')).toString('hex')
```javascript
// txb.addInput(prevTx, vout, sequence, prevTxScript)
txb.addInput('TX_ID', TX_VOUT, null, p2wpkhAlice1.output) 
```

Pay 0.999 BTC to bob_1 public key hash
```javascript
txb.addOutput(p2pkhBob1.address, 999e5)
```

> The miner fee is calculated by subtracting the outputs from the inputs.
> 100 000 000 - 99 900 000 = 100 000
> 100 000 satoshis equals 0,001 BTC, this is the miner fee.

We don't have to specify any redeem or witness scripts here, since we are spending a native segwit UTXO.
But we need to sign the input value.
```javascript
// txb.sign(index, keyPair, redeemScript, sign.hashType, value, witnessScript)
txb.sign(0, keyPairAlice1, null, null, 1e8, null)
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
Alice signature and public key. The semantics of P2WPKH is the same as the semantics of P2PKH, except that the signature 
is not placed at the same location as before.

In the vout section we have one `witness_v0_keyhash` output, which is the code name for native Segwit.


## What's Next?

Continue "PART TWO: PAY TO PUBLIC KEY HASH" with [4.2: Typical Transaction (1 input, 2 outputs) - Native Segwit P2WPKH](04_2_P2WPKH_Typical_Tx_1_2.md).
