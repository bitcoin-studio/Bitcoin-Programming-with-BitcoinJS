const bitcoin = require('bitcoinjs-lib')
const { alice } = require('./wallets.json')
const network = bitcoin.networks.regtest

const witnessScript = bitcoin.script.compile([
  bitcoin.opcodes.OP_ADD,
  bitcoin.opcodes.OP_5,
  bitcoin.opcodes.OP_EQUAL])

const p2wsh = bitcoin.payments.p2wsh({redeem: {output: witnessScript, network}, network})
console.log('p2wsh.address  ', p2wsh.address)

const keyPairAlice1 = bitcoin.ECPair.fromWIF(alice[1].wif, network)
const p2wpkhAlice1 = bitcoin.payments.p2wpkh({pubkey: keyPairAlice1.publicKey, network})

const txb = new bitcoin.TransactionBuilder(network)

txb.addInput('TX_ID', TX_VOUT)

txb.addOutput(p2wpkhAlice1.address, 999e5)

const tx = txb.buildIncomplete()

const witness = [Buffer.from('02','hex'), Buffer.from('03','hex'), p2wsh.redeem.output]
tx.setWitness(0, witness)

console.log('tx.toHex()  ', tx.toHex())