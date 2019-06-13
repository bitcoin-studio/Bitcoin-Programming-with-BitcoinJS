const bitcoin = require('bitcoinjs-lib')
const { alice, bob } = require('./wallets.json')
const network = bitcoin.networks.regtest

// Signer
const keyPairAlice0 = bitcoin.ECPair.fromWIF(alice[0].wif, network)

// Change address
const keyPairAlice1 = bitcoin.ECPair.fromWIF(alice[1].wif, network)
const p2pkhAlice1 = bitcoin.payments.p2pkh({pubkey: keyPairAlice1.publicKey, network})

// Recipient
const keyPairBob0 = bitcoin.ECPair.fromWIF(bob[0].wif, network)
const p2pkhBob0 = bitcoin.payments.p2pkh({pubkey: keyPairBob0.publicKey, network})

const txb = new bitcoin.TransactionBuilder(network)
txb.addInput('TX_ID', TX_VOUT)
txb.addOutput(p2pkhBob0.address, 5e7) // the actual "spend"
txb.addOutput(p2pkhAlice1.address, 499e5) // Alice's change

txb.sign(0, keyPairAlice0)

const tx = txb.build()
console.log('tx.toHex()  ', tx.toHex())