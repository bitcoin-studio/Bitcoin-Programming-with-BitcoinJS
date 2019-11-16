# Submarine Swap - On-chain to Off-chain

{% hint style="info" %}
To follow along this tutorial:

* You need to have at least two LND nodes linked by a working payment channel  
  * One LND node is the merchant \(lncli-merchant\)    
  * One LND node is the swap provider \(lncli-sp\)  
{% endhint %}

A bitcoin user \(alice\_1\) would like to pay on-chain a merchant selling a good off-chain, using a _swap provider_ \(bob\_1\). Technically alice\_1 could operate the swap provider herself, but we will suppose here that the _swap provider_ is a trustless third party.

This animation sums up the process.

![submarine swap - paying merchant on2off](../../.gitbook/assets/submarine_swap_pay_merchant.gif)

Explanation:

* The merchant starts by generating a Lightning invoice.
* The merchant transmits the _payment hash_ of this invoice to swap provider. 
* The swap provider creates the P2WSH HTLC swap smart contract and generates its bitcoin address.
* The swap provider prompts the user to pay this bitcoin address. 
* Once the swap contract has been paid and confirmed, the swap provider pay the Lightning invoice.
* The _payment preimage_ is revealed which allows him to redeem the funds locked in the swap contract.
* Lastly, if the swap provider fails to pay the Lightning invoice, the user can redeem the funds after a timelock.

## Generating a Lightning invoice

The merchant creates a Lightning invoice \(also called payment request\) for 1000 satoshis.

```bash
$ lncli-merchant addinvoice 1000
PAYMENT_REQUEST and PAYMENT_HASH
```

This payment hash is the SHA256 hash of the _**payment preimage**_, the secret revealed when the invoice is paid.

`addinvoice` returns the payment hash, but we can also get it by decoding the payment request.

```bash
$ lncli-merchant decodepayreq PAYMENT_REQUEST
PAYMENT_HASH
```

We can now imagine that the merchant sends this PAYMENT\_HASH to the swap provider.

## Creating and Funding the P2WSH Swap Contract

The goal now is for the swap provider to create the swap P2WSH smart contract, generate its bitcoin address and ask the bitcoin user to pay this address.

Import libraries, test wallets and set the network.

```javascript
const bitcoin = require('bitcoinjs-lib')
const { alice, bob } = require('./wallets.json')
const network = bitcoin.networks.regtest
const bip65 = require('bip65')
```

Here is the swap smart contract that we will use. This is technically a witness script. This contract is a Hash Time Locked Contract \(HTLC\) The LN _payment hash_ is the SHA256 hash of the preimage. In order to save bytes, the swap contract hashlock is a HASH160, the RIPEMD160 of the _payment hash_.

```javascript
const swapContractGenerator = function(claimPublicKey, refundPublicKey, preimageHash, cltv) {
  return bitcoin.script.compile([
    bitcoin.opcodes.OP_HASH160,
    bitcoin.crypto.ripemd160(Buffer.from(PAYMENT_HASH, 'hex')),
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

We prepare the key pairs for our three personas.

```javascript
// Signers
const keyPairUser = bitcoin.ECPair.fromWIF(alice[1].wif, network)
const keyPairSwapProvider = bitcoin.ECPair.fromWIF(bob[1].wif, network)
```

We have to choose a timelock expressed in block height.  
Check the current block height and add 10 blocks to it. It means that the refund transaction will only be available 10 blocks after that the funding of the swap contract is confirmed.

```bash
getblockchaininfo
```

```javascript
const timelock = bip65.encode({ blocks: TIMELOCK })
console.log('Timelock expressed in block height:')
console.log(timelock)
```

We now have all the elements to generate the swap contract, namely the swap provider's public key, the user's public key, the Lightning invoice's payment hash and the timelock.

```javascript
const swapContract = swapContractGenerator(keyPairSwapProvider.publicKey, keyPairUser.publicKey, PAYMENT_HASH, timelock)
console.log('Swap contract (witness script):')
console.log(swapContract.toString('hex'))
```

We can decode the swap contract \(witness script\) in Bitcoin Core CLI.

```bash
decodescript SWAP_CONTRACT
```

Generate the bitcoin address of our swap contract.  
The `p2wsh` method will generate an object that contains the P2WSH address.

```javascript
const p2wsh = bitcoin.payments.p2wsh({redeem: {output: swapContract, network}, network})
console.log('P2WSH swap smart contract address:')
console.log(p2wsh.address)
```

The swap provider asks our bitcoin user alice\_1 to pay this address.  
Alice\_1 sends 1200 satoshis to the P2WSH swap smart contract address.

> The user is paying 200 satoshis more than what is asked by the merchant to compensate for the mining fees that the swap provider will have to pay to redeem the funds.
>
> ```bash
> sendtoaddress SWAP_CONTRACT_ADDRESS 0.000012
> ```

Get the output index \(TX\_VOUT\). The swap provider \(or the user in the refund case\) will need it to redeem the funds.

```bash
gettransaction TX_ID
```

or

```bash
getrawtransaction TX_ID
```

The output script of our funding transaction is a versioned witness program. It is composed as follow: `<00 version byte>` + `<32-byte hash witness program>`.  
The 32-byte witness program is the SHA256 hash of the witness script, which we will provide when redeeming the funds.

```javascript
console.log(bitcoin.crypto.sha256(SWAP_CONTRACT).toString('hex'))
```

or

```bash
bx sha256 SWAP_CONTRACT
```

## Creating the Redeem Transaction

Now that the swap contract is funded, the swap provider must pay the merchant's invoice in order to get the _payment preimage_ that allows him to redeem the swap contract on-chain funds.

```bash
$ lncli-sp payinvoice PAYMENT_REQUEST
PAYMENT_PREIMAGE
```

Prepare the bitcoin addresses of the potential recipients.  
Either the swap provider in the happy case, or the user in the refund case.

```javascript
const p2wpkhSwapProvider = bitcoin.payments.p2wpkh({pubkey: keyPairSwapProvider.publicKey, network})
console.log('Swap provider redeem address:')
console.log(p2wpkhSwapProvider.address)

const p2wpkhUser = bitcoin.payments.p2wpkh({pubkey: keyPairUser.publicKey, network})
console.log('Swap provider redeem address:')
console.log(p2wpkhUser.address)
```

Create an instance of BitcoinJS TransactionBuilder.

```javascript
const txb = new bitcoin.TransactionBuilder(network)
```

For the refund case we need to set the transaction-level locktime in our redeem transaction in order to spend a CLTV timelock. You can use the same value as before.

> Because CLTV actually uses nLocktime enforcement consensus rules the time is checked indirectly by comparing redeem transaction-level nLocktime with the CLTV value.  
> nLocktime must be &lt;= present time and &gt;= CLTV timelock

```javascript
txb.setLockTime(timelock)
```

Set the transaction input by pointing to the swap contract UTXO we are spending.

```javascript
// txb.addInput(prevTx, prevOut, sequence, prevTxScript)
txb.addInput(TX_ID, TX_VOUT, 0xfffffffe)
```

Set the transaction output.

```javascript
// Happy case: swap provider redeems the funds to his address.
txb.addOutput(p2wpkhSwapProvider.address, 1e3)

// Refund case: the user redeems the funds to his address
txb.addOutput(p2wpkhUser.address, 1e3)
```

{% hint style="info" %}
The bitcoin user alice\_1 has paid the swap contract 1200 satoshis and the redeemer is only taking 1000 satoshis.  
We leave 200 satoshis in mining fees.
{% endhint %}

Prepare the transaction.

```javascript
const tx = txb.buildIncomplete()
```

Generate the _signature hash_, the actual message that we will sign.  
Amongst other things, it commits to the witness script, the bitcoin amount of the UTXO we are spending and the sighash type.

```javascript
const sigHash = bitcoin.Transaction.SIGHASH_ALL
signatureHash = tx.hashForWitnessV0(0, buffer.from(WITNESS_SCRIPT, 'hex'), 12e2, sigHash)
console.log('Signature hash:')
console.log(signatureHash.toString('hex'))
```

### Adding the witness data

Our redeem transaction is almost ready, we just need to add the witness data that will unlock the swap contract output script.

Happy case: Swap Provider is able to spend the P2WSH.  
The swap provider provides a valid signature and the _payment preimage_.

```javascript
const witnessStackClaimBranch = bitcoin.payments.p2wsh({
  redeem: {
    input: bitcoin.script.compile([
      bitcoin.script.signature.encode(keyPairSwapProvider.sign(signatureHash), sigHash),
      buffer.from(PREIMAGE, 'hex')
    ]),
    output: buffer.from(WITNESS_SCRIPT, 'hex')
  }
}).witness

console.log('Happy case witness stack:')
console.log(witnessStackClaimBranch.map(x => x.toString('hex')))
```

Failure case: User ask a refund after the timelock has expired.  
The user provides a valid signature and any invalid preimage in order to trigger the _else_ branch of the swap contract.

```javascript
const witnessStackRefundBranch = bitcoin.payments.p2wsh({
  redeem: {
    input: bitcoin.script.compile([
      bitcoin.script.signature.encode(keyPairUser.sign(signatureHash), sigHash),
      Buffer.from('0000000000000000000000000000000000000000000000000000000000000001', 'hex')
    ]),
    output: buffer.from(WITNESS_SCRIPT, 'hex')
  }
}).witness

console.log('Refund case witness stack:')
console.log(witnessStackRefundBranch.map(x => x.toString('hex')))
```

Choose your scenario by setting the witness stack.

```javascript
tx.setWitness(0, witnessStackClaimBranch)
// tx.setWitness(0, witnessStackRefundBranch)
```

Print the redeem transaction.

```javascript
console.log('Redeem transaction:')
console.log(tx.toHex())
```

## Observations

If the swap provider do not fail to pay the merchant, our bitcoin user has paid on-chain, in a trustless manner, a merchant that is selling a good off-chain.

For both scenarios we note that our scriptSig is empty.

For the first scenario, we note that our witness stack contains:

* Bob\_1 swap provider signature
* The LN payment preimage
* The witness script, that we can decode with `decodescript` 

For the second scenario, we note that our witness stack contains:

* Alice\_1 user signature
* A dummy LN payment preimage
* The witness script, that we can decode with `decodescript`

## What's Next?

Continue "Part Two: Pay To Script Hash" with [Reverse Submarine Swap - Off-chain to On-chain](swap_off2on_p2wsh.md).

