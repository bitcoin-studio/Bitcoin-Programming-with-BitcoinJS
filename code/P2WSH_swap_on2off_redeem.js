// Import dependencies
const bitcoin = require('bitcoinjs-lib')
const { alice, bob, dave } = require('./wallets.json')
const network = bitcoin.networks.regtest
const bip65 = require('bip65')

// Variables
const TX_ID = '511c639decb6e213fffcf0df30ca42d45d37713205d2eab02e684ae3f08d5ac6'
const TX_VOUT = 0
const PREIMAGE = '8b2d0e6b92d5ff350882efd043e057723f973d1bd914170f44dc4c9cbb1bc654'
const TIMELOCK = 168
const WITNESS_SCRIPT = 'a9148b93d63345397fd623e9e69d1668b23cb9fe7658876321027efbabf425077cdbceb73f6681c7ebe2ade74a65ea57ebcf0c42364d3822c5906702a800b1752103745c9aceb84dcdeddf2c3cdc1edb0b0b5af2f9bf85612d73fa6394758eaee35d68ac'
const IS_REFUND = false

// Signers
const keyPairUser = bitcoin.ECPair.fromWIF(alice[1].wif, network)
const keyPairSwapProvider = bitcoin.ECPair.fromWIF(bob[1].wif, network)

// Generate bitcoin addresses
const p2wpkhSwapProvider = bitcoin.payments.p2wpkh({pubkey: keyPairSwapProvider.publicKey, network})
console.log('Swap provider redeem address:')
console.log(p2wpkhSwapProvider.address)
const p2wpkhUser = bitcoin.payments.p2wpkh({pubkey: keyPairUser.publicKey, network})
console.log('User redeem address:')
console.log(p2wpkhUser.address)

// Create an instance of BitcoinJS TransactionBuilder
const txb = new bitcoin.TransactionBuilder(network)

// Set timelock
const timelock = bip65.encode({ blocks: TIMELOCK })
console.log('Timelock expressed in block height:')
console.log(timelock)
txb.setLockTime(timelock)

// Add input
txb.addInput(TX_ID, TX_VOUT, 0xfffffffe)

// Add outputs
// Happy case: swap provider redeems the funds to his address.
!IS_REFUND && txb.addOutput(p2wpkhSwapProvider.address, 1e3)

// Refund case: the user redeems the funds to his address
IS_REFUND && txb.addOutput(p2wpkhUser.address, 1e3)

// Prepare transaction
const tx = txb.buildIncomplete()

// Prepare signature hash
const sigHash = bitcoin.Transaction.SIGHASH_ALL
signatureHash = tx.hashForWitnessV0(0, Buffer.from(WITNESS_SCRIPT, 'hex'), 12e2, sigHash)
console.log('Signature hash:')
console.log(signatureHash.toString('hex'))

// Happy case: Swap Provider is able to spend the P2WSH
const witnessStackClaimBranch = bitcoin.payments.p2wsh({
  redeem: {
    input: bitcoin.script.compile([
      bitcoin.script.signature.encode(keyPairSwapProvider.sign(signatureHash), sigHash),
      Buffer.from(PREIMAGE, 'hex')
    ]),
    output: Buffer.from(WITNESS_SCRIPT, 'hex')
  }
}).witness
console.log('Happy case witness stack:')
console.log(witnessStackClaimBranch.map(x => x.toString('hex')))

// Failure case: User ask a refund after the timelock has expired
const witnessStackRefundBranch = bitcoin.payments.p2wsh({
  redeem: {
    input: bitcoin.script.compile([
      bitcoin.script.signature.encode(keyPairUser.sign(signatureHash), sigHash),
      Buffer.from('0000000000000000000000000000000000000000000000000000000000000001', 'hex')
    ]),
    output: Buffer.from(WITNESS_SCRIPT, 'hex')
  }
}).witness
console.log('Refund case witness stack:')
console.log(witnessStackRefundBranch.map(x => x.toString('hex')))

// Set witness data
!IS_REFUND && tx.setWitness(0, witnessStackClaimBranch)
IS_REFUND && tx.setWitness(0, witnessStackRefundBranch)

// Print
console.log('Redeem transaction:')
console.log(tx.toHex())