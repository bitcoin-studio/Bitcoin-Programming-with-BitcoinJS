# 7.4: Computational Puzzle: SHA-1 Collision

> To follow along this tutorial 
> * Execute all the transaction code in one go by typing `node code/filename.js`
> * Or enter the commands step-by-step by `cd` into `./code` then type `node` in a terminal to open the Node.js REPL
> * Open the Bitcoin Core GUI console or use `bitcoin-cli` for the Bitcoin Core commands
> * Use `bx` aka `Libbitcoin-explorer` as a handy complement 

On September 13, 2013, Peter Todd, a renowned Bitcoin Core developer, announced a bounty on BitcoinTalk forum. As he explain himself, 
"rewards at P2SH addresses are available for anyone able to demonstrate collision attacks against a variety of cryptographic algorithms. 
You collect your bounty by demonstrating two messages that are not equal in value, yet result in the same digest when hashed. 
These messages are used in a scriptSig, which satisfies the scriptPubKey storing the bountied funds, allowing you to 
move them to a scriptPubKey (Bitcoin address) of your choice".

On the February 23, 2017, someone successfully claimed the SHA-1 hash collision bounty of 2.48 BTC, with this transaction 
[8d31992805518fd62daa3bdd2a5c4fd2cd3054c9b3dca1d78055e9528cff6adc](https://blockstream.info/tx/8d31992805518fd62daa3bdd2a5c4fd2cd3054c9b3dca1d78055e9528cff6adc)

> To read more about Bitcoin computational puzzles and Peter Todd bounties
> * [REWARD offered for hash collisions for SHA1, SHA256, RIPEMD160 and other](https://bitcointalk.org/index.php?topic=293382.0)
> * [Christopher Allen Guide - Writing Puzzle Scripts](https://github.com/ChristopherA/Learning-Bitcoin-from-the-Command-Line/blob/master/11_1_Writing_Puzzle_Scripts.md)

Let's recreate the Peter Todd bounty for SHA-1 hash collision. 


## Creating and Funding the P2SH 

Import libraries, test wallets and set the network
```javascript
const bitcoin = require('bitcoinjs-lib')
const { alice } = require('./wallets.json')
const network = bitcoin.networks.regtest
```

Create the script and generate its address.
```javascript
const redeemScript = bitcoin.script.compile([
  bitcoin.opcodes.OP_2DUP,
  bitcoin.opcodes.OP_EQUAL,
  bitcoin.opcodes.OP_NOT,
  bitcoin.opcodes.OP_VERIFY,
  bitcoin.opcodes.OP_SHA1,
  bitcoin.opcodes.OP_SWAP,
  bitcoin.opcodes.OP_SHA1,
  bitcoin.opcodes.OP_EQUAL])
  
console.log('redeemScript  ', redeemScript.toString('hex'))
```

You can decode the redeem script in Bitcoin Core CLI.
```
$ decodescript 6e879169a77ca787
```

The `p2sh` method will generate an object that contains the P2SH address.
```javascript
const p2sh = bitcoin.payments.p2sh({redeem: {output: redeemScript, network}, network})
```

Let's fund this address with 1 BTC. This is the reward for whoever as the solution to the locking script.
```
$ sendtoaddress 2MyJKxYR2zNZZsZ39SgkCXWCfQtXKhnWSWq 1
```

Get the output index so that we have the outpoint (txid / vout).
> Find the output index (or vout) under `details > vout`.
```
$ gettransaction "txid"
```


## Preparing the spending transaction

Now let's prepare the spending transaction by setting input and output.

Alice_1 wants to send the funds to her P2WPKH address.
```javascript
const keyPairAlice1 = bitcoin.ECPair.fromWIF(alice[1].wif, network)
const p2wpkhAlice1 = bitcoin.payments.p2wpkh({pubkey: keyPairAlice1.publicKey, network})
```

Create a BitcoinJS transaction builder object.
```javascript
const txb = new bitcoin.TransactionBuilder(network)
```

Create the input by referencing the outpoint of our P2SH funding transaction.
Create the output, leaving 100 000 satoshis as mining fees.
```javascript
txb.addInput('TX_ID', TX_VOUT)
txb.addOutput(p2wpkhAlice1.address, 999e5)
```

Prepare the transaction.
```javascript
const tx = txb.buildIncomplete()
```


## Creating the unlocking script

Now we can update the transaction with the unlocking script, providing a solution to the SHA-1 bounty.
 
Here are the two values that have been used to claim the Peter Todd bounty.
```javascript
const value_1 = '255044462d312e330a25e2e3cfd30a0a0a312030206f626a0a3c3c2f57696474682032203020522f4865696768742033203020522f547970652034203020522f537562747970652035203020522f46696c7465722036203020522f436f6c6f7253706163652037203020522f4c656e6774682038203020522f42697473506572436f6d706f6e656e7420383e3e0a73747265616d0affd8fffe00245348412d3120697320646561642121212121852fec092339759c39b1a1c63c4c97e1fffe017f46dc93a6b67e013b029aaa1db2560b45ca67d688c7f84b8c4c791fe02b3df614f86db1690901c56b45c1530afedfb76038e972722fe7ad728f0e4904e046c230570fe9d41398abe12ef5bc942be33542a4802d98b5d70f2a332ec37fac3514e74ddc0f2cc1a874cd0c78305a21566461309789606bd0bf3f98cda8044629a1'
const value_2 = '255044462d312e330a25e2e3cfd30a0a0a312030206f626a0a3c3c2f57696474682032203020522f4865696768742033203020522f547970652034203020522f537562747970652035203020522f46696c7465722036203020522f436f6c6f7253706163652037203020522f4c656e6774682038203020522f42697473506572436f6d706f6e656e7420383e3e0a73747265616d0affd8fffe00245348412d3120697320646561642121212121852fec092339759c39b1a1c63c4c97e1fffe017346dc9166b67e118f029ab621b2560ff9ca67cca8c7f85ba84c79030c2b3de218f86db3a90901d5df45c14f26fedfb3dc38e96ac22fe7bd728f0e45bce046d23c570feb141398bb552ef5a0a82be331fea48037b8b5d71f0e332edf93ac3500eb4ddc0decc1a864790c782c76215660dd309791d06bd0af3f98cda4bc4629b1'
```

We provide the two values above as the answer, plus the redeem script. 
```javascript
const InputScriptP2SH = bitcoin.script.compile([
  Buffer.from(value_1, 'hex'),
  Buffer.from(value_2, 'hex'), 
  p2sh.redeem.output
])
tx.setInputScript(0, InputScriptP2SH)
```
> In order to push data we should use OP_PUSHDATA    
> Here, regarding the length of the values, we should use OP_PUSHDATA2, followed by two bytes that contain the number of    
> bytes to be pushed onto the stack in little endian order.   
> Fortunately, BitcoinJS is taking care of that for us.    
> If you inspect `InputScriptP2SH`, you will see that the values are preceded by `4d4001`.    
> `4d` is the OP_PUSHDATA2 opcode, which states that the next two bytes contain the number of bytes to be pushed onto the stack in little endian order.   
> `0140` is 320 in decimal, which is the length of the values.      

We don't need to sign this transaction since the redeem script doesn't ask for a signature.

Get the raw hex serialization.
> No `build` step here as we have already called `buildIncomplete`
```javascript
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

Check the hash collision 
```
bitcoin.crypto.sha1(Buffer.from(value_1, 'hex')).toString('hex')
bitcoin.crypto.sha1(Buffer.from(value_2, 'hex')).toString('hex')
```
Both returns the same hash, `f92d74e3874587aaf443d1db961d4e26dde13e9c`.

Peter Todd's other bounties (SHA256, RIPEMD160, RIPEMD160-SHA256, SHA256-SHA256) remain unclaimed at the time of this writing. 
They're all written in the same manner as the SHA-1 example above.


## What's Next?

Continue "PART THREE: PAY TO SCRIPT HASH" with [8.0: Multi-signature Transactions](08_0_Multisig_Transactions.md).
