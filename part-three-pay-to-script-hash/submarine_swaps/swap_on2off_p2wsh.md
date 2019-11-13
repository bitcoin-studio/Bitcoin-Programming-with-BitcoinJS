# Submarine Swap - On-chain to Off-chain

{% hint style="info" %}  
To follow along this tutorial:  
* You need to have at least two LND nodes linked by a working payment channel  
  * One LND node is the merchant (lncli-merchant)    
  * One LND node is the swap provider (lncli-sp)  
{% endhint %}  
&nbsp;

A bitcoin user (alice_1) would like to pay on-chain a merchant (bob_1) selling a good off-chain, using a *swap provider* (dave_1).
Technically alice_1 could operate the swap provider herself, but we will suppose here that the *swap provider* is a trustless third party.
&nbsp;

This animation sums up the process.
![submarine_swap_pay_merchant](../../assets/submarine_swap_pay_merchant.gif)
&nbsp;

Explanation:
* The merchant starts by generating a Lightning invoice.
* The merchant transmits the *payment hash* of this invoice to swap provider. 
* The swap provider creates the P2WSH HTLC swap smart contract and generates its bitcoin address.
* The swap provider prompts the user to pay this bitcoin address. 
* Once the swap contract has been paid and confirmed, the swap provider pay the Lightning invoice.
* The _payment preimage_ is revealed which allows him to redeem the funds locked in the swap contract.
* Lastly, if the swap provider fails to pay the Lightning invoice, the user can redeem the funds after a timelock.
&nbsp;



## Generating a Lightning invoice

The merchant bob_1 creates a Lightning invoice (also called payment request) for 1000 satoshis.  
```shell
$ lncli-merchant addinvoice 1000
PAYMENT_REQUEST
```
&nbsp;

The merchant extract the payment hash from the invoice.  
This payment hash is the SHA256 hash of the payment preimage, the secret revealed when the invoice is paid.
```shell
$ lncli-merchant decodepayreq PAYMENT_REQUEST
PAYMENT_HASH
```
&nbsp;

We can now imagine that the merchant sends this PAYMENT_HASH to the swap provider.  
&nbsp;



## Creating and Funding the P2WSH Swap Contract

The goal now is for the swap provider to create the swap P2WSH smart contract, generate its bitcoin address and ask the bitcoin user to pay this address.
&nbsp;

Import libraries, test wallets and set the network.
```js
const bitcoin = require('bitcoinjs-lib')
const { alice, bob, dave } = require('./wallets.json')
const network = bitcoin.networks.regtest
const bip65 = require('bip65')
```
&nbsp;

Here is the swap smart contract that we will use. This is technically a witness script.
This contract is a Hash Time Locked Contract (HTLC) 
The LN *payment hash* is the SHA256 hash of the preimage. 
In order to save bytes, the swap contract hashlock is a HASH160, the RIPEMD160 of the *payment hash*. 
```js
const swapContractGenerator = function(claimPublicKey, refundPublicKey, preimageHash, cltv) {
  return bitcoin.script.compile([
    bitcoin.opcodes.OP_HASH160,
    bitcoin.crypto.ripemd160(PAYMENT_HASH), // HASH160 of invoice payment hash
    bitcoin.opcodes.OP_EQUAL,
    bitcoin.opcodes.OP_IF,
    claimPublicKey,
    bitcoin.opcodes.OP_ELSE,
    bitcoin.script.number.encode(cltv),
    bitcoin.opcodes.OP_CHECKLOCKTIMEVERIFY,
    bitcoin.opcodes.OP_DROP,
    refundPublicKey,
    bitcoin.opcodes.OP_ENDIF,
    bitcoin.opcodes.OP_CHECKSIG,
  ])
}
```
&nbsp;

We prepare the key pairs for our three personas.
```js
// Signers
const keyPairUser = bitcoin.ECPair.fromWIF(alice[1].wif, network)
const keyPairMerchant = bitcoin.ECPair.fromWIF(bob[1].wif, network)
const keyPairSwapProvider = bitcoin.ECPair.fromWIF(dave[1].wif, network)
```
&nbsp;

We have to choose a timelock expressed in block height.  
Check the current block height and add 10 blocks to it. 
It means that the refund transaction will only be available 10 blocks after that the funding of the swap contract is confirmed. 
```shell
getblockchaininfo
```

```js
const timelock = bip65.encode({ blocks: TIMELOCK })
console.log('Timelock expressed in block height:')
console.log(timelock)
```
&nbsp;

We now have all the elements to generate the swap contract, namely the swap provider's public key, the user's public key, the Lightning invoice's payment hash and the timelock.
```js
let swapContract
swapContract =  swapContractGenerator(keyPairSwapProvider.publicKey, keyPairUser.publicKey, PAYMENT_HASH, timelock)

console.log('Swap contract (witness script):')
console.log(swapContract.toString('hex'))
```
&nbsp;

We can decode the swap contract (witness script) in Bitcoin Core CLI.
```shell
decodescript SWAP_CONTRACT
```
&nbsp;

Generate the bitcoin address of our swap contract.  
The `p2wsh` method will generate an object that contains the P2WSH address.
```js
const p2wsh = bitcoin.payments.p2wsh({redeem: {output: swapContract, network}, network})
console.log('P2WSH swap smart contract address:')
console.log(p2wsh.address)
```
&nbsp;

The swap provider asks our bitcoin user alice_1 to pay this address.  
Alice_1 sends 1200 satoshis to the P2WSH swap smart contract address.
> The user is paying 200 satoshis more than what is asked by the merchant to compensate for the mining fees that the swap provider will have to pay to redeem the funds.  
```shell
sendtoaddress SWAP_CONTRACT_ADDRESS 0.000012
```
&nbsp;

Get the output index (TX_VOUT). The swap provider (or the user in the refund case) will need it to redeem the funds.  
```shell
gettransaction TX_ID
```
or
```shell
getrawtransaction TX_ID
```
&nbsp;

The output script of our funding transaction is a versioned witness program. It is composed as follow: \<00 version byte\> + \<32-byte hash witness program\>.  
The 32-byte witness program is the SHA256 hash of the witness script, which we will provide when redeeming the funds.
```js
console.log(bitcoin.crypto.sha256(SWAP_CONTRACT).toString('hex'))
```
or
```shell
bx sha256 SWAP_CONTRACT
```
&nbsp;



## Creating the Redeem Transaction

Now that the swap contract is funded, the swap provider must pay the merchant's invoice in order to get the *payment preimage* that allows him to redeem the swap contract on-chain funds.
```shell
$ lncli-sp payinvoice PAYMENT_REQUEST
PAYMENT_PREIMAGE
```
&nbsp;

Prepare the bitcoin addresses of the potential recipients.   
Either the swap provider in the happy case, or the user in the refund case. 
```js
const p2wpkhSwapProvider = bitcoin.payments.p2wpkh({pubkey: keyPairSwapProvider.publicKey, network})
console.log('Swap provider redeem address:')
console.log(p2wpkhSwapProvider.address)

const p2wpkhUser = bitcoin.payments.p2wpkh({pubkey: keyPairUser.publicKey, network})
console.log('Swap provider redeem address:')
console.log(p2wpkhUser.address)
```
&nbsp;

Create an instance of BitcoinJS TransactionBuilder.
```js
const txb = new bitcoin.TransactionBuilder(network)
```
&nbsp;

Set the transaction input by pointing to the swap contract UTXO we are spending. 
```js
// txb.addInput(prevTx, prevOut, sequence, prevTxScript)
txb.addInput(TX_ID, TX_VOUT, 0xfffffffe)
```
&nbsp;

Set the transaction output.  
```js
// Happy case: swap provider redeems the funds to his address.
txb.addOutput(p2wpkhSwapProvider.address, 1e3)

// Refund case: the user redeems the funds to his address
txb.addOutput(p2wpkhUser.address, 1e3)
```
&nbsp;

{% hint style="info" %}  
The bitcoin user alice_1 has paid the swap contract 1200 satoshis and the redeemer is only taking 1000 satoshis.  
We leave 200 satoshis in mining fees.  
{% endhint %}  
&nbsp;

Prepare the transaction.
```js
const tx = txb.buildIncomplete()
```
&nbsp;

Generate the *signature hash*, the actual message that we will sign.  
Amongst other things, it commits to the witness script, the bitcoin amount of the UTXO we are spending and the sighash type.  
```js
const sigHash = bitcoin.Transaction.SIGHASH_ALL
signatureHash = tx.hashForWitnessV0(0, WITNESS_SCRIPT, 12e2, sigHash)
console.log('Signature hash:')
console.log(signatureHash.toString('hex'))
```
&nbsp;



### Adding the witness data

Our redeem transaction is almost ready, we just need to add the witness data that will unlock the swap contract output script.   

Happy case: Swap Provider is able to spend the P2WSH.  
The swap provider provides a valid signature and the *payment preimage*.  
```js
const witnessStackClaimBranch = bitcoin.payments.p2wsh({
  redeem: {
    input: bitcoin.script.compile([
      bitcoin.script.signature.encode(keyPairSwapProvider.sign(signatureHash), hashType),
      PREIMAGE
    ]),
    output: WITNESS_SCRIPT
  }
}).witness

console.log('Happy case witness stack:')
console.log(witnessStackClaimBranch.map(x => x.toString('hex')))
```
&nbsp;

Failure case: User ask a refund after the timelock has expired.  
The user provides a valid signature and any invalid preimage in order to trigger the *else* branch of the swap contract.
```js
const witnessStackRefundBranch = bitcoin.payments.p2wsh({
  redeem: {
    input: bitcoin.script.compile([
      bitcoin.script.signature.encode(keyPairUser.sign(signatureHash), hashType),
      Buffer.from('0000000000000000000000000000000000000000000000000000000000000001', 'hex')
    ]),
    output: WITNESS_SCRIPT
  }
}).witness

console.log('Refund case witness stack:')
console.log(witnessStackRefundBranch.map(x => x.toString('hex')))
```
&nbsp;

Choose your scenario by setting the witness stack.
```js
tx.setWitness(0, witnessStackClaimBranch)
// tx.setWitness(0, witnessStackRefundBranch)
```
&nbsp;

Print the redeem transaction.
```js
console.log('Redeem transaction:')
console.log(tx.toHex())
```
&nbsp;



## Observations

If the swap provider do not fail to pay the merchant, our bitcoin user has paid on-chain, in a trustless manner, a merchant that is selling a good off-chain.  

For both scenarios we note that our scriptSig is empty.  

For the first scenario, we note that our witness stack contains:
* Dave\_1 swap provider signature
* The LN payment preimage
* The witness script, that we can decode with `decodescript` 

For the second scenario, we note that our witness stack contains:
* Alice\_1 user signature
* A dummy LN payment preimage
* The witness script, that we can decode with `decodescript`
&nbsp;



## What's Next?

Continue "Part Two: Pay To Script Hash" with [Reverse Submarine Swap - Off-chain to On-chain](swap_off2on_p2wsh.md).

