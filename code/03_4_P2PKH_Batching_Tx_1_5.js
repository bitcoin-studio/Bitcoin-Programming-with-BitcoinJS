const bitcoin = require('bitcoinjs-lib')
const { alice, bob, carol, dave } = require('./wallets.json')
const network = bitcoin.networks.regtest

const keyPairAlice0 = bitcoin.ECPair.fromWIF(alice[0].wif, network)

const keyPairBob0 = bitcoin.ECPair.fromWIF(bob[0].wif, network)
const p2pkhBob0 = bitcoin.payments.p2pkh({pubkey: keyPairBob0.publicKey, network})
const keyPairBob1 = bitcoin.ECPair.fromWIF(bob[1].wif, network)
const p2pkhBob1 = bitcoin.payments.p2pkh({pubkey: keyPairBob1.publicKey, network})
const keyPairBob2 = bitcoin.ECPair.fromWIF(bob[2].wif, network)
const p2pkhBob2 = bitcoin.payments.p2pkh({pubkey: keyPairBob2.publicKey, network})
const keyPairCarol0 = bitcoin.ECPair.fromWIF(carol[0].wif, network)
const p2pkhCarol0 = bitcoin.payments.p2pkh({pubkey: keyPairCarol0.publicKey, network})
const keyPairDave0 = bitcoin.ECPair.fromWIF(dave[0].wif, network)
const p2pkhDave0 = bitcoin.payments.p2pkh({pubkey: keyPairDave0.publicKey, network})

const txb = new bitcoin.TransactionBuilder(network)
txb.addInput('TX_ID', TX_VOUT)

txb.addOutput(p2pkhBob0.address, 2e7)
txb.addOutput(p2pkhBob1.address, 2e7)
txb.addOutput(p2pkhBob2.address, 2e7)
txb.addOutput(p2pkhCarol0.address, 2e7)
txb.addOutput(p2pkhDave0.address, 2e7)

txb.sign(0, keyPairAlice0)

const tx = txb.build()
console.log('tx.toHex()  ', tx.toHex())