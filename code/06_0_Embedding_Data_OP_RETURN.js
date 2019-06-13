const bitcoin = require('bitcoinjs-lib')
const { alice } = require('./wallets.json')
const network = bitcoin.networks.regtest

const keyPairAlice0 = bitcoin.ECPair.fromWIF(alice[0].wif, network)
const p2wpkhAlice0 = bitcoin.payments.p2wpkh({pubkey: keyPairAlice0.publicKey, network})

const txb = new bitcoin.TransactionBuilder(network)

// txb.addInput(prevTx, vout, sequence, prevTxScript)
txb.addInput('TX_ID', TX_VOUT, null, p2wpkhAlice0.output)

const data = Buffer.from('Programmable money FTW!', 'utf8')
const embed = bitcoin.payments.embed({data: [data]})
txb.addOutput(embed.output, 0)
txb.addOutput(p2wpkhAlice0.address, 99900000)

// txb.sign(index, keyPair, redeemScript, sign.hashType, value, witnessScript)
txb.sign(0, keyPairAlice0, null, null, 1e8)

const tx = txb.build()
console.log('tx.toHex()', tx.toHex())