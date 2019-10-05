const bitcoin = require('bitcoinjs-lib')
const { alice, bob, carol, dave } = require('./wallets.json')
const network = bitcoin.networks.regtest

// Participants
const keyPairAlice1 = bitcoin.ECPair.fromWIF(alice[1].wif, network)
const keyPairBob1 = bitcoin.ECPair.fromWIF(bob[1].wif, network)
const keyPairCarol1 = bitcoin.ECPair.fromWIF(carol[1].wif, network)
const keyPairDave1 = bitcoin.ECPair.fromWIF(dave[1].wif, network)

// Recipient
const keyPairAlice2 = bitcoin.ECPair.fromWIF(alice[2].wif, network)
const p2wpkhAlice2 = bitcoin.payments.p2wpkh({pubkey: keyPairAlice2.publicKey, network})

// Build transaction
const p2ms = bitcoin.payments.p2ms({
  m: 2, pubkeys: [
    keyPairAlice1.publicKey,
    keyPairBob1.publicKey,
    keyPairCarol1.publicKey,
    keyPairDave1.publicKey], network})

const p2wsh = bitcoin.payments.p2wsh({redeem: p2ms, network})

const txb = new bitcoin.TransactionBuilder(network)

txb.addInput('6528a606f3707d05429344fb03a467bd3c69687ebeb40c7e3dacc3102fafacf8', 1)
txb.addOutput(p2wpkhAlice2.address, 999e5)

// Signing
// txb.sign(index, keyPair, redeemScript, sign.hashType, value, witnessScript)
txb.sign(0, keyPairAlice1, null, null, 1e8, p2wsh.redeem.output)
txb.sign(0, keyPairBob1, null, null, 1e8, p2wsh.redeem.output)

const tx = txb.build()
console.log('tx.toHex()  ', tx.toHex())