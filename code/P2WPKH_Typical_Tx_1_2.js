const bitcoin = require('bitcoinjs-lib')
const { alice, bob } = require('./wallets.json')
const network = bitcoin.networks.regtest

// Signer
const keyPairAlice1 = bitcoin.ECPair.fromWIF(alice[1].wif, network)
const p2wpkhAlice1 = bitcoin.payments.p2wpkh({pubkey: keyPairAlice1.publicKey, network})

// Recipient
const keyPairBob1 = bitcoin.ECPair.fromWIF(bob[1].wif, network)
const p2wpkhBob1 = bitcoin.payments.p2wpkh({pubkey: keyPairBob1.publicKey, network})

// Build the tx
const txb = new bitcoin.TransactionBuilder(network)
// txb.addInput(prevTx, vout, sequence, prevTxScript)
txb.addInput('TX_ID', TX_VOUT, null, p2wpkhAlice1.output)

txb.addOutput(p2wpkhBob1.address, 5e7)
txb.addOutput(p2wpkhAlice1.address, 499e5)

// txb.sign(index, keyPair, redeemScript, sign.hashType, value, witnessScript)
txb.sign(0, keyPairAlice1, null, null, 1e8, null)

const tx = txb.build()
console.log('tx.toHex()  ', tx.toHex())