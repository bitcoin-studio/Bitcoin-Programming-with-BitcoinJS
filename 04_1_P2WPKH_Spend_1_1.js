const bitcoin = require('bitcoinjs-lib')
const { alice, bob } = require('./wallets.json')
const network = bitcoin.networks.regtest

const keyPairAlice0 = bitcoin.ECPair.fromWIF(alice[0].wif, network)
const p2wpkhAlice0 = bitcoin.payments.p2wpkh({pubkey: keyPairAlice0.publicKey, network})

const keyPairBob0 = bitcoin.ECPair.fromWIF(bob[0].wif, network)
const p2pkhBob0 = bitcoin.payments.p2pkh({pubkey: keyPairBob0.publicKey, network})

const txb = new bitcoin.TransactionBuilder(network)

// txb.addInput(prevTx, input.vout, input.sequence, prevTxScript)
txb.addInput('TX_ID', TX_VOUT, null, p2wpkhAlice0.output)

txb.addOutput(p2pkhBob0.address, 999e5)

// txb.sign(index, keyPair, redeemScript, sign.hashType, value, witnessScript)
txb.sign(0, keyPairAlice0, null, null, 1e8)

const tx = txb.build()
console.log('tx.toHex()  ', tx.toHex())