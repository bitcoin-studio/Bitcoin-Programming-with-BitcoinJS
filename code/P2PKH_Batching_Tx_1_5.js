const bitcoin = require('bitcoinjs-lib')
const { alice, bob, carol, dave, eve, mallory } = require('./wallets.json')
const network = bitcoin.networks.regtest

// Signer
const keyPairAlice1 = bitcoin.ECPair.fromWIF(alice[1].wif, network)

// Recipients
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

// Create 1 input
const txb = new bitcoin.TransactionBuilder(network)
txb.addInput('TX_ID', TX_VOUT)

// Create 5 outputs
txb.addOutput(p2pkhBob1.address, 2e7)
txb.addOutput(p2pkhCarol1.address, 2e7)
txb.addOutput(p2pkhDave1.address, 2e7)
txb.addOutput(p2pkhEve1.address, 2e7)
txb.addOutput(p2pkhMallory1.address, 2e7)

// Sign
txb.sign(0, keyPairAlice1)

// Build the transaction
const tx = txb.build()
console.log('tx.toHex()  ', tx.toHex())