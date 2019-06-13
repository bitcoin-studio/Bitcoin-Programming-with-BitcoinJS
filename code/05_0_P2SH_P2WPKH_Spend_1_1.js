const bitcoin = require('bitcoinjs-lib')
const { alice, bob } = require('./wallets.json')
const network = bitcoin.networks.regtest

const keyPairAlice0 = bitcoin.ECPair.fromWIF(alice[0].wif, network)
const p2wpkhAlice0 = bitcoin.payments.p2wpkh({pubkey: keyPairAlice0.publicKey, network})
const p2shAlice0 = bitcoin.payments.p2sh({redeem: p2wpkhAlice0, network})

const keyPairBob0 = bitcoin.ECPair.fromWIF(bob[0].wif, network)
const p2wpkhBob0 = bitcoin.payments.p2wpkh({pubkey: keyPairBob0.publicKey, network})

const txb = new bitcoin.TransactionBuilder(network)

txb.addInput('TX_ID', TX_VOUT)
txb.addOutput(p2wpkhBob0.address, 999e5)

// txb.sign(index, keyPair, redeemScript, sign.hashType, value, witnessScript)
txb.sign(0, keyPairAlice0, p2shAlice0.redeem.output, null, 1e8)

const tx = txb.build()
console.log('tx.toHex()', tx.toHex())