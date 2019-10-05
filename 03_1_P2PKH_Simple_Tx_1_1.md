# 3.1: Simple Transaction (1 input, 1 output) - Legacy P2PKH

> To follow along this tutorial
> * Execute all the transaction code in one go by typing `node code/filename.js`   
> * Or enter the commands step-by-step by `cd` into `./code` then type `node` in a terminal to open the Node.js REPL   
> * Open the Bitcoin Core GUI console or use `bitcoin-cli` for the Bitcoin Core commands   
> * Use `bx` aka `Libbitcoin-explorer` as a handy complement   
  
Let's create a legacy P2PKH transaction with 1 input and 1 output.


## Create UTXO to spend from

First we need to create a previous transaction in order to have a UTXO at our disposal.

Import libraries, test wallets and set the network
```javascript
const bitcoin = require('bitcoinjs-lib')
const { alice, bob } = require('./wallets.json')
const network = bitcoin.networks.regtest
```

Send 1 BTC to alice_1 P2PKH address with Bitcoin Core CLI.
> Check out **_[02_0: Generating and Importing Wallets](02_0_Generating_and_Importing_Wallets.md)_** and your `wallets.json`
> file in the `code` directory. Replace the address if necessary.
```
$ sendtoaddress n4SvybJicv79X1Uc4o3fYXWGwXadA53FSq 1
```

We have now an UTXO locked with alice_1 public key hash. 
In order to spend it, we refer to it with the transaction id (txid) and the output index (vout), also called **outpoint**.
Fortunately, `sendtoaddress` returns the id of the transaction.

Get the output index so that we have the outpoint (txid / vout).
> Find the output index (or vout) under `details > vout`.
```
$ gettransaction "txid"
```


## Creating the simple transaction

Now let's spend the UTXO with BitcoinJS.

Create a bitcoinJS key pair object for alice_1, the spender of our new UTXO, and the only one capable of spending it. 
```javascript
const keyPairAlice1 = bitcoin.ECPair.fromWIF(alice[1].wif, network)
```

Create a key pair object and a P2PKH address for the recipient bob_1.
```javascript
const keyPairBob1 = bitcoin.ECPair.fromWIF(bob[1].wif, network)
const p2pkhBob1 = bitcoin.payments.p2pkh({pubkey: keyPairBob1.publicKey, network})
```

Create a BitcoinJS transaction builder object.
Add the input by filling it with the outpoint (previous values txId and vout).
Add the output with the bob_1 P2PKH recipient address and the amount of 0.999 btc.
```javascript
const txb = new bitcoin.TransactionBuilder(network)
txb.addInput('TX_ID', TX_VOUT)
txb.addOutput(p2pkhBob1.address, 999e5)
```

> The miner fee is calculated by subtracting the outputs from the inputs.
> 100 000 000 - 99 900 000 = 100 000
> 100 000 satoshis equals 0,001 BTC, this is the miner fee.

The UTXO is locked with alice_1's public key hash.
If she wants to spend it, she needs to prove her ownership of the private key that is linked to the public 
key, which hash is written in the UTXO.

To do so, alice_1 will sign this transaction that we just built with her private key. 
BitcoinJS will automatically place the signature into the `scriptSig` field of the input 0. 
```javascript
txb.sign(0, keyPairAlice1)
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


## What's Next?

Continue "PART TWO: PAY TO PUBLIC KEY HASH" with [3.2: Typical Transaction (1 input, 2 outputs) - Legacy P2PKH](03_2_P2PKH_Typical_Tx_1_2.md).
