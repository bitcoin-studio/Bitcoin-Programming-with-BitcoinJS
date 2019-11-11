const bitcoin = require('bitcoinjs-lib')
const { alice, bob, carol, dave, eve, mallory } = require('./wallets.json')
const network = bitcoin.networks.regtest

// Signers
const keyPairAlice1 = bitcoin.ECPair.fromWIF(alice[1].wif, network)
const keyPairCarol1 = bitcoin.ECPair.fromWIF(carol[1].wif, network)
const keyPairEve1 = bitcoin.ECPair.fromWIF(eve[1].wif, network)
const keyPairMallory1 = bitcoin.ECPair.fromWIF(mallory[1].wif, network)

// Recipients
const keyPairBob1 = bitcoin.ECPair.fromWIF(bob[1].wif, network)
const p2pkhBob1 = bitcoin.payments.p2pkh({pubkey: keyPairBob1.publicKey, network})

const keyPairDave1 = bitcoin.ECPair.fromWIF(dave[1].wif, network)
const p2pkhDave1 = bitcoin.payments.p2pkh({pubkey: keyPairDave1.publicKey, network})

const keyPairMallory2 = bitcoin.ECPair.fromWIF(mallory[2].wif, network)
const p2pkhMallory2 = bitcoin.payments.p2pkh({pubkey: keyPairMallory2.publicKey, network})

const keyPairAlice2 = bitcoin.ECPair.fromWIF(alice[2].wif, network)
const p2pkhAlice2 = bitcoin.payments.p2pkh({pubkey: keyPairAlice2.publicKey, network})

// Signer's change
const p2pkhEve1 = bitcoin.payments.p2pkh({pubkey: keyPairEve1.publicKey, network})
const p2pkhMallory1 = bitcoin.payments.p2pkh({pubkey: keyPairMallory1.publicKey, network})

//
const txb = new bitcoin.TransactionBuilder(network)

// Add inputs
txb.addInput('TX_ID', TX_VOUT)
txb.addInput('TX_ID', TX_VOUT)
txb.addInput('TX_ID', TX_VOUT)
txb.addInput('TX_ID', TX_VOUT)

// Add outputs
txb.addOutput(p2pkhBob1.address, 2e7)
txb.addOutput(p2pkhDave1.address, 2e7)
txb.addOutput(p2pkhMallory2.address, 2e7)
txb.addOutput(p2pkhAlice2.address, 2e7)
txb.addOutput(p2pkhEve1.address, 5e6 - 5e4)
txb.addOutput(p2pkhMallory1.address, 1e7 - 5e4)

// Sign
// Make sure each signer will sign the right input
txb.sign(0, keyPairAlice1)
txb.sign(1, keyPairCarol1)
txb.sign(2, keyPairEve1)
txb.sign(3, keyPairMallory1)

// Build the transaction
const tx = txb.build()
console.log('tx.toHex()  ', tx.toHex())