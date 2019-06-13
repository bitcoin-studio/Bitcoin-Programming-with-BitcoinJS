const bitcoin = require('bitcoinjs-lib')
const { alice, bob } = require('./wallets.json')
const network = bitcoin.networks.regtest

const keyPairAlice0 = bitcoin.ECPair.fromWIF(alice[0].wif, network)
const keyPairAlice1 = bitcoin.ECPair.fromWIF(alice[1].wif, network)
const keyPairAlice2 = bitcoin.ECPair.fromWIF(alice[2].wif, network)

const p2wpkhAlice0 = bitcoin.payments.p2wpkh({pubkey: keyPairAlice0.publicKey, network})

const txb = new bitcoin.TransactionBuilder(network)
txb.addInput('TX_ID', TX_VOUT)
txb.addInput('TX_ID', TX_VOUT)
txb.addInput('TX_ID', TX_VOUT)
txb.addInput('TX_ID', TX_VOUT)
txb.addInput('TX_ID', TX_VOUT)
txb.addOutput(p2wpkhAlice0.address, 999e5)

txb.sign(0, keyPairAlice0)
txb.sign(1, keyPairAlice0)
txb.sign(2, keyPairAlice0)
txb.sign(3, keyPairAlice1)
txb.sign(4, keyPairAlice2)

const tx = txb.build()
console.log('tx.toHex()  ', tx.toHex())