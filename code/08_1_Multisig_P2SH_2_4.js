const bitcoin = require('bitcoinjs-lib')
const { alice, bob, carol, dave } = require('./wallets.json')
const network = bitcoin.networks.regtest

const keyPairAlice0 = bitcoin.ECPair.fromWIF(alice[0].wif, network)
const keyPairBob0 = bitcoin.ECPair.fromWIF(bob[0].wif, network)
const keyPairCarol0 = bitcoin.ECPair.fromWIF(carol[0].wif, network)
const keyPairDave0 = bitcoin.ECPair.fromWIF(dave[0].wif, network)

const keyPairAlice1 = bitcoin.ECPair.fromWIF(alice[1].wif, network)
const p2wpkhAlice1 = bitcoin.payments.p2wpkh({pubkey: keyPairAlice1.publicKey, network})

const p2ms = bitcoin.payments.p2ms({
  m: 2, pubkeys: [
    keyPairAlice0.publicKey,
    keyPairBob0.publicKey,
    keyPairCarol0.publicKey,
    keyPairDave0.publicKey], network})

const p2sh = bitcoin.payments.p2sh({redeem: p2ms, network})

const txb = new bitcoin.TransactionBuilder(network)

txb.addInput('TX_ID', TX_VOUT)
txb.addOutput(p2wpkhAlice1.address, 999e5)

// txb.sign(index, keyPair, redeemScript, sign.hashType, value, witnessScript)
txb.sign(0, keyPairAlice0, p2sh.redeem.output)
txb.sign(0, keyPairBob0, p2sh.redeem.output)

const tx = txb.build()
console.log('tx.toHex()  ', tx.toHex())