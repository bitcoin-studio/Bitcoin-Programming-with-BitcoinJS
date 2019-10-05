# 3.3: UTXO Consolidation (3 inputs, 1 output) - Legacy P2PKH

> To follow along this tutorial
> * Execute all the transaction code in one go by typing `node code/filename.js`   
> * Or enter the commands step-by-step by `cd` into `./code` then type `node` in a terminal to open the Node.js REPL   
> * Open the Bitcoin Core GUI console or use `bitcoin-cli` for the Bitcoin Core commands
> * Use `bx` aka `Libbitcoin-explorer` as a handy complement 


Let's do UTXO consolidation, also called an aggregating transaction.

The idea is that a single signer aggregates many small UTXOs into a single big UTXO. This represents the real-world 
equivalent of exchanging a pile of coins and currency notes for a single larger note. 
> Check out **_[3.5: Coinjoin Transaction (4 inputs, 4 outputs) - Legacy P2PKH](03_5_P2PKH_Coinjoin_Tx_4_4.md)_** for 
> multiple signers.

In legacy P2PKH transaction, each input contains a signature, which quickly increases the size of your transactions if 
you need to spend multiple UTXOs, resulting in high fees. Consolidation allows to group multiple UTXOs in one, which will
result in less fees when spent.

Reducing the number of UTXOs also frees the UTXOs database (chainstate), making it easier to run a full node, 
marginally improving Bitcoin’s decentralisation and overall security, which is always nice.

Finally, consolidation gives an opportunity to update the addresses you use for your UTXOs, for example to roll keys over, 
switch to multisig, or switch to Segwit bech32 addresses.

For this example we will consolidate three P2PKH UTXOs (referencing each of them with three inputs) to one Segwit P2WPKH UTXO.


## Create UTXOs to spend from

First we need to create three UTXOs. We will do this with a single transaction using `sendmany`.

Import libraries, test wallets and set the network
```javascript
const bitcoin = require('bitcoinjs-lib')
const { alice } = require('./wallets.json')
const network = bitcoin.networks.regtest
```

UTXO consolidation makes sense if we have multiple payments on a single address, or multiple payments on different 
addresses controlled by a single person or entity.

Let's use different P2PKH addresses, all controlled by Alice.
We will have one payment to alice_1 P2PKH address, one to alice_2 P2PKH address and one to alice_3 P2PKH address.

Let's send this three payments, of 0.2 BTC each. 
> Check out **_[02_0: Generating and Importing Wallets](02_0_Generating_and_Importing_Wallets.md)_** and your `wallets.json`
> file in the `code` directory. Replace the address if necessary.
```
$ sendmany "" '{"n4SvybJicv79X1Uc4o3fYXWGwXadA53FSq":0.33, "mgZt5Fqzszdwf8hDgZt3mUf7js611aKRPc":0.33, "n3ZLcnCtfRucM4WLnXqukm9bTdb1PWeETk":0.33}'
```

We have now three UTXOs locked with Alice public keys hash. 
In order to spend it, we refer to it with the transaction id (txid) and the output index (vout), also called **outpoint**.

Get the output indexes of the transaction, so that we have their outpoint (txid / vout).
> Find the output index (or vout) under `details > vout`.   
> Each UXTO appears twice, once in the 'send' category, once in the 'receive' category.   
> You may think that the indexes will be 0, 1 and 2. If so you are forgetting that there is also a change UTXO, that can be located at any position.   
> The command `gettransaction` doesn't display the change UTXO, but a `decoderawtransaction` does.   
```
$ gettransaction "txid"
```


## Creating the aggregating transaction

Now let's spend the UTXOs with BitcoinJS, consolidating them into a single P2WPKH UTXO.

Create Alice's key pairs. 
```javascript
const keyPairAlice1 = bitcoin.ECPair.fromWIF(alice[1].wif, network)
const keyPairAlice2 = bitcoin.ECPair.fromWIF(alice[2].wif, network)
const keyPairAlice3 = bitcoin.ECPair.fromWIF(alice[3].wif, network)
```

The recipient address.
```javascript
const p2wpkhAlice1 = bitcoin.payments.p2wpkh({pubkey: keyPairAlice1.publicKey, network})
```

Create a BitcoinJS transaction builder object.
Add the three inputs by providing the outpoints.
Add the P2WPKH output with an amount of 0.99 BTC.
```javascript
const txb = new bitcoin.TransactionBuilder(network)
txb.addInput('TX_ID', TX_VOUT)
txb.addInput('TX_ID', TX_VOUT)
txb.addInput('TX_ID', TX_VOUT)
txb.addOutput(p2wpkhAlice1.address, 989e5) 
```

> The miner fee is calculated by subtracting the outputs from the inputs.
> (33 000 000 + 33 000 000 + 33 000 000) - 98 900 000 = 100 000
> 100 000 satoshis equals 0,001 BTC, this is the miner fee.

Alice adds the correct signature to each input. 
> For each input, we have to select the right keyPair to produce signatures that satisfy the locking scripts of the three UTXOs we are spending.
> We have this information by calling `gettransaction`.      
> For example   
> txb.sign(0, keyPairAlice1)   
> txb.sign(1, keyPairAlice3)   
> txb.sign(2, keyPairAlice2)   
```javascript
txb.sign(0, keyPairAlice)
txb.sign(1, keyPairAlice)
txb.sign(2, keyPairAlice)
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
Spending Segwit UTXOs results in much smaller transaction since the input scripts are empty and Segwit data are discounted.
Also, the implementation of Schnorr signatures into Bitcoin would allow to aggregate all those signatures into one.  


## What's Next?

Continue "PART TWO: PAY TO PUBLIC KEY HASH" with [3.4: Batching Transaction (1 input, 5 outputs) - Legacy P2PKH](03_4_P2PKH_Batching_Tx_1_5.md).
