const bitcoin = require('bitcoinjs-lib')
const { alice, bob, carol, dave, eve, mallory } = require('./wallets.json')
const network = bitcoin.networks.regtest

const keyPairAlice0 = bitcoin.ECPair.fromWIF(alice[0].wif, network)
const keyPairCarol0 = bitcoin.ECPair.fromWIF(carol[0].wif, network)
const keyPairEve0 = bitcoin.ECPair.fromWIF(eve[0].wif, network)
const keyPairMallory1 = bitcoin.ECPair.fromWIF(mallory[1].wif, network)

const keyPairBob0 = bitcoin.ECPair.fromWIF(bob[0].wif, network)
const p2pkhBob0 = bitcoin.payments.p2pkh({pubkey: keyPairBob0.publicKey, network})

const keyPairDave0 = bitcoin.ECPair.fromWIF(dave[0].wif, network)
const p2pkhDave0 = bitcoin.payments.p2pkh({pubkey: keyPairDave0.publicKey, network})

const keyPairMallory0 = bitcoin.ECPair.fromWIF(mallory[0].wif, network)
const p2pkhMallory0 = bitcoin.payments.p2pkh({pubkey: keyPairMallory0.publicKey, network})

const keyPairAlice1 = bitcoin.ECPair.fromWIF(alice[1].wif, network)
const p2pkhAlice1 = bitcoin.payments.p2pkh({pubkey: keyPairAlice1.publicKey, network})

const p2pkhEve0 = bitcoin.payments.p2pkh({pubkey: keyPairEve0.publicKey, network})
const p2pkhMallory1 = bitcoin.payments.p2pkh({pubkey: keyPairMallory1.publicKey, network})

const txb = new bitcoin.TransactionBuilder(network)

txb.addInput('TX_ID', TX_VOUT)
txb.addInput('TX_ID', TX_VOUT)
txb.addInput('TX_ID', TX_VOUT)
txb.addInput('TX_ID', TX_VOUT)

txb.addOutput(p2pkhBob0.address, 2e7)
txb.addOutput(p2pkhDave0.address, 2e7)
txb.addOutput(p2pkhMallory0.address, 2e7)
txb.addOutput(p2pkhAlice1.address, 2e7)

txb.addOutput(p2pkhEve0.address, 5e6 - 5e4)
txb.addOutput(p2pkhMallory1.address, 1e7 - 5e4)

txb.sign(0, keyPairAlice0)
txb.sign(1, keyPairCarol0)
txb.sign(2, keyPairEve0)
txb.sign(3, keyPairMallory1)

const tx = txb.build()
console.log('tx.toHex()  ', tx.toHex())