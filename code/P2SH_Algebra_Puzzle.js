const bitcoin = require('bitcoinjs-lib')
const { alice } = require('./wallets.json')
const network = bitcoin.networks.regtest

const redeemScript = bitcoin.script.compile([
  bitcoin.opcodes.OP_ADD,
  bitcoin.opcodes.OP_5,
  bitcoin.opcodes.OP_EQUAL])

console.log('redeemScript  ', redeemScript.toString('hex'))

const p2sh = bitcoin.payments.p2sh({redeem: {output: redeemScript, network}, network})

const keyPairAlice1 = bitcoin.ECPair.fromWIF(alice[1].wif, network)
const p2wpkhAlice1 = bitcoin.payments.p2wpkh({pubkey: keyPairAlice1.publicKey, network})

const txb = new bitcoin.TransactionBuilder(network)

txb.addInput('TX_ID', TX_VOUT)

txb.addOutput(p2wpkhAlice1.address, 999e5)

const tx = txb.buildIncomplete()

const InputScriptP2SH = bitcoin.script.compile([bitcoin.opcodes.OP_2, bitcoin.opcodes.OP_3, p2sh.redeem.output])
tx.setInputScript(0, InputScriptP2SH)

console.log('tx.toHex()  ', tx.toHex())