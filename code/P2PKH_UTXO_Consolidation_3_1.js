const bitcoin = require('bitcoinjs-lib')
const { alice } = require('./wallets.json')
const network = bitcoin.networks.regtest

const keyPairAlice1 = bitcoin.ECPair.fromWIF(alice[1].wif, network)
const keyPairAlice2 = bitcoin.ECPair.fromWIF(alice[2].wif, network)
const keyPairAlice3 = bitcoin.ECPair.fromWIF(alice[3].wif, network)

const p2wpkhAlice1 = bitcoin.payments.p2wpkh({pubkey: keyPairAlice1.publicKey, network})

const txb = new bitcoin.TransactionBuilder(network)
txb.addInput('TX_ID', TX_VOUT)
txb.addInput('TX_ID', TX_VOUT)
txb.addInput('TX_ID', TX_VOUT)
txb.addOutput(p2wpkhAlice1.address, 989e5)

// For each input, we have to select the right keyPair to produce signatures that satisfy the locking scripts of the
// three UTXOs we are spending. We have this information by calling `gettransaction`.
txb.sign(0, keyPairAlice)
txb.sign(1, keyPairAlice)
txb.sign(2, keyPairAlice)

const tx = txb.build()
console.log('tx.toHex()  ', tx.toHex())