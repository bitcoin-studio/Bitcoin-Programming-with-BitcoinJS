# 3.3: UTXO Consolidation (5 inputs, 1 output) - Legacy P2PKH

> To follow along this tutorial and enter the commands step-by-step
> * Type `node` in a terminal after `cd` into `./code` for a Javascript prompt
> * Open the Bitcoin Core GUI console or use `bitcoin-cli` for the Bitcoin Core commands
> * Use `bx` aka `Libbitcoin-explorer` as a handy complement 


Let's do UTXO consolidation, also called an aggregating transaction.

The idea is that a single signatory aggregates many small UTXOs into a single big UTXO. This represents the real-world 
equivalent of exchanging a pile of coins and currency notes for a single larger note. 
> Check out **_[3.5: Coinjoin Transaction (4 inputs, 4 outputs) - Legacy P2PKH](03_5_P2PKH_Coinjoin_Tx_4_4.md)_** for 
> multiple signatories.

In legacy P2PKH transaction, each input contains a signature, which quickly increases the size of your transactions if 
you need to spend multiple UTXOs, and hence the fees you pay.

Consolidation also gives an opportunity to update the addresses you use for your UTXOs, for example to roll keys over, 
switch to multisig, or switch to Segwit bech32 addresses.
Finally, reducing the number of UTXOs frees the UTXOs database (chainstate), making it easier to run a full node, 
marginally improving Bitcoin’s decentralisation and overall security, which is always nice.

For this example we will move five P2PKH UTXOs, referencing each of them with five inputs, to one Segwit P2WPKH UTXO.
Note that with a P2WPKH UTXO we don't have this issue anymore since an input spending it will not contain anything.
Check out **_[04_1: Spend a Native Segwit P2WPKH UTXO](04_1_P2WPKH_Spend_1_1.md)_** for an illustration.


## Create UTXOs to spend from

First we need to create five previous transactions in order to have five UTXOs at our disposal.

Import libraries, test wallets and set the network
```javascript
const bitcoin = require('bitcoinjs-lib')
const { alice, bob } = require('./wallets.json')
const network = bitcoin.networks.regtest
```

UTXO consolidation makes sense if we have multiple payments to a single address, or multiple payments to different 
addresses controlled by a single person or entity.

Let's use different addresses, all controlled by Alice.
We will have three payments to Alice_0 P2PKH address, one to Alice_1 P2PKH address and one to Alice_2 P2PKH address.

Let's send this five payments, of 0.2 BTC each. 
> Check out **_[02_0: Generating and Importing Wallets](02_0_Generating_and_Importing_Wallets.md)_** and your `wallets.json`
> file in the `code` directory. Replace the address if necessary.
```
$ sendtoaddress n4SvybJicv79X1Uc4o3fYXWGwXadA53FSq 0.2
$ sendtoaddress n4SvybJicv79X1Uc4o3fYXWGwXadA53FSq 0.2
$ sendtoaddress n4SvybJicv79X1Uc4o3fYXWGwXadA53FSq 0.2
$ sendtoaddress mgZt5Fqzszdwf8hDgZt3mUf7js611aKRPc 0.2
$ sendtoaddress n3ZLcnCtfRucM4WLnXqukm9bTdb1PWeETk 0.2
```

We have now five UTXOs locked with Alice public keys hash. 
In order to spend it, we refer to it with the transaction id (txid) and the output index (vout), also called **outpoint**.

Get the output indexes of the five transactions, so that we have their outpoint (txid / vout).
> Find the output index (or vout) under `details > vout`.
```
$ gettransaction "txid"
$ gettransaction "txid"
$ gettransaction "txid"
$ gettransaction "txid"
$ gettransaction "txid"
```


## Creating the aggregating transaction

Now let's spend the UTXOs with BitcoinJS, consolidating them into a single P2WPKH UTXO.

Create Alice's key pairs. 
```javascript
const keyPairAlice0 = bitcoin.ECPair.fromWIF(alice[0].wif, network)
const keyPairAlice1 = bitcoin.ECPair.fromWIF(alice[1].wif, network)
const keyPairAlice2 = bitcoin.ECPair.fromWIF(alice[2].wif, network)
```

```javascript
const p2wpkhAlice0 = bitcoin.payments.p2wpkh({pubkey: keyPairAlice0.publicKey, network})
```

Create a BitcoinJS transaction builder object.
Add the five inputs by providing the outpoints.
Add the P2WPKH output with an amount of 0.999 BTC.
```javascript
const txb = new bitcoin.TransactionBuilder(network)
txb.addInput('TX_ID', TX_VOUT)
txb.addInput('TX_ID', TX_VOUT)
txb.addInput('TX_ID', TX_VOUT)
txb.addInput('TX_ID', TX_VOUT)
txb.addInput('TX_ID', TX_VOUT)
txb.addOutput(p2wpkhAlice0.address, 999e5) 
```

> The miner fee is calculated by subtracting the outputs from the inputs.
> (20 000 000 + 20 000 000 + 20 000 000 + 20 000 000 + 20 000 000) - 99 900 000 = 100 000
> 100 000 satoshis equals 0,001 BTC, this is the miner fee.

Alice adds the correct signature to each input. 
```javascript
txb.sign(0, keyPairAlice0)
txb.sign(1, keyPairAlice0)
txb.sign(2, keyPairAlice0)
txb.sign(3, keyPairAlice1)
txb.sign(4, keyPairAlice2)
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

We note that each input contains a 71 bytes signature (on average), resulting in a large and costly transaction.
Spending Segwit UTXOs results in much smaller transaction since the inputs are empty.
Also, the implementation of Schnorr signatures into Bitcoin would allow to aggregate all those signatures into one.  
