# 3.4: Batching Transaction (1 input, 5 outputs) - Legacy P2PKH

> To follow along this tutorial
> * Execute all the transaction code in one go by typing `node code/filename.js`   
> * Or enter the commands step-by-step by `cd` into `./code` then type `node` in a terminal to open the Node.js REPL   
> * Open the Bitcoin Core GUI console or use `bitcoin-cli` for the Bitcoin Core commands
> * Use `bx` aka `Libbitcoin-explorer` as a handy complement 


Let's create a batching transaction, also called distributing transaction.

It is a transaction that distributes one input to multiple outputs representing multiple recipients. This type of 
transaction is sometimes used by commercial entities to distribute funds, such as when processing payroll payments to 
multiple employees.

For this example we will spend a legacy P2PKH UTXO and distribute it to five different P2PKH addresses.


## Create a UTXO to spend from

Import libraries, test wallets and set the network
```javascript
const bitcoin = require('bitcoinjs-lib')
const { alice, bob, carol, dave, eve, mallory } = require('./wallets.json')
const network = bitcoin.networks.regtest
```

First we need to create a previous transaction in order to have an UTXO at our disposal.
Send 1.001 BTC to alice_1 P2PKH address with Bitcoin Core CLI (0.001 will be spent on the mining fees).
> Check out your `wallets.json` file in the `code` directory. Replace the address if necessary.   
```
$ sendtoaddress n4SvybJicv79X1Uc4o3fYXWGwXadA53FSq 1.001
```

We have now a UTXO locked with alice_1 public key hash. 
In order to spend it, we refer to it with the transaction id (txid) and the output index (vout), also called **outpoint**.

Get the output indexes of the five transactions, so that we have their outpoint (txid / vout).
> Find the output index (or vout) under `details > vout`.
```
$ gettransaction "txid"
```


## Creating the batching transaction

Now let's spend the UTXO with BitcoinJS.

Create a BitcoinJS key pair for alice_1, the spender of our new UTXO. 
```javascript
const keyPairAlice1 = bitcoin.ECPair.fromWIF(alice[1].wif, network)
```

Create five different P2PKH addresses.
```javascript
const keyPairBob1 = bitcoin.ECPair.fromWIF(bob[1].wif, network)
const p2pkhBob1 = bitcoin.payments.p2pkh({pubkey: keyPairBob1.publicKey, network})
const keyPairCarol1 = bitcoin.ECPair.fromWIF(carol[1].wif, network)
const p2pkhCarol1 = bitcoin.payments.p2pkh({pubkey: keyPairCarol1.publicKey, network})
const keyPairDave1 = bitcoin.ECPair.fromWIF(dave[1].wif, network)
const p2pkhDave1 = bitcoin.payments.p2pkh({pubkey: keyPairDave1.publicKey, network})
const keyPairEve1 = bitcoin.ECPair.fromWIF(eve[1].wif, network)
const p2pkhEve1 = bitcoin.payments.p2pkh({pubkey: keyPairEve1.publicKey, network})
const keyPairMallory1 = bitcoin.ECPair.fromWIF(mallory[1].wif, network)
const p2pkhMallory1 = bitcoin.payments.p2pkh({pubkey: keyPairMallory1.publicKey, network})
```

Create a BitcoinJS transaction builder object.
Add the input by providing the outpoint.
```javascript
const txb = new bitcoin.TransactionBuilder(network)
txb.addInput('TX_ID', TX_VOUT)
```

Add the outputs, distributing 0.2 BTC to each five addresses.
```javascript
txb.addOutput(p2pkhBob1.address, 2e7)
txb.addOutput(p2pkhCarol1.address, 2e7) 
txb.addOutput(p2pkhDave1.address, 2e7)
txb.addOutput(p2pkhEve1.address, 2e7)
txb.addOutput(p2pkhMallory1.address, 2e7)
```

> The miner fee is calculated by subtracting the outputs from the inputs.
> 100 100 000 - (20 000 000 + 20 000 000 + 20 000 000 + 20 000 000 + 20 000 000) = 100 000
> 100 000 satoshis equals 0,001 BTC, this is the miner fee.

Alice_1 signs the transaction that we just built with her private key. 
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

Inspect the transaction.
```
$ getrawtransaction "txid" true
```


## Observations

We note that we have five outputs, locking 0.2 BTC each to five different public key hash / addresses. 


## What's Next?

Continue "PART TWO: PAY TO PUBLIC KEY HASH" with [3.5: Coinjoin Transaction (4 inputs, 4 outputs) - Legacy P2PKH](03_5_P2PKH_Coinjoin_Tx_4_4.md).
