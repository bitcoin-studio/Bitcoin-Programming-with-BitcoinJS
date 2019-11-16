// Import dependencies
const bitcoin = require('bitcoinjs-lib')
const { alice, bob } = require('./wallets.json')
const network = bitcoin.networks.regtest
const bip65 = require('bip65')

// Variables
const TX_ID = ''
const TX_VOUT = 0
const PREIMAGE = ''
const TIMELOCK = 0
const WITNESS_SCRIPT = ''
const IS_REFUND = false

// Signers
const keyPairUser = bitcoin.ECPair.fromWIF(alice[1].wif, network)
const keyPairSwapProvider = bitcoin.ECPair.fromWIF(bob[1].wif, network)

// Generate bitcoin addresses
const p2wpkhSwapProvider = bitcoin.payments.p2wpkh({pubkey: keyPairSwapProvider.publicKey, network})
console.log('Swap provider redeem address:')
console.log(p2wpkhSwapProvider.address)
console.log()

const p2wpkhUser = bitcoin.payments.p2wpkh({pubkey: keyPairUser.publicKey, network})
console.log('User redeem address:')
console.log(p2wpkhUser.address)
console.log()

// Create an instance of BitcoinJS TransactionBuilder
const txb = new bitcoin.TransactionBuilder(network)

// Set timelock
const timelock = bip65.encode({ blocks: TIMELOCK })
if (IS_REFUND) {
  txb.setLockTime(timelock)
  console.log('Timelock expressed in block height:')
  console.log(timelock)
  console.log()
}

// Add input
txb.addInput(TX_ID, TX_VOUT, 0xfffffffe)

// Add outputs
if (IS_REFUND) {
  // Refund case: the user redeems the funds to his address
  txb.addOutput(p2wpkhUser.address, 1e3)
} else {
  // Happy case: swap provider redeems the funds to his address.
  txb.addOutput(p2wpkhSwapProvider.address, 1e3)
}

// Prepare transaction
const tx = txb.buildIncomplete()

// Prepare signature hash
const sigHash = bitcoin.Transaction.SIGHASH_ALL
signatureHash = tx.hashForWitnessV0(0, Buffer.from(WITNESS_SCRIPT, 'hex'), 12e2, sigHash)
console.log('Signature hash:')
console.log(signatureHash.toString('hex'))
console.log()

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
console.log()

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
console.log()

// Set witness data
if (IS_REFUND){
  tx.setWitness(0, witnessStackRefundBranch)
} else {
  tx.setWitness(0, witnessStackClaimBranch)
}

// Preimage's HASH160
console.log('Preimage\'s HASH160')
console.log(bitcoin.crypto.hash160(Buffer.from(PREIMAGE, 'hex')).toString('hex'))
console.log()

// Print
console.log('Redeem transaction:')
console.log(tx.toHex())
