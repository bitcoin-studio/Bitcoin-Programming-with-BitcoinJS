function csvCheckSigOutput(aQ, bQ, sequence) {
  return bitcoin.script.compile([
    bitcoin.opcodes.OP_IF,
    bitcoin.script.number.encode(sequence),
    bitcoin.opcodes.OP_CHECKSEQUENCEVERIFY,
    bitcoin.opcodes.OP_DROP,

    bitcoin.opcodes.OP_ELSE,
    bQ.publicKey,
    bitcoin.opcodes.OP_CHECKSIGVERIFY,
    bitcoin.opcodes.OP_ENDIF,

    aQ.publicKey,
    bitcoin.opcodes.OP_CHECKSIG,
  ])
}

const bitcoin = require('bitcoinjs-lib')
const { alice, bob } = require('./wallets.json')
const network = bitcoin.networks.regtest
const hashType = bitcoin.Transaction.SIGHASH_ALL

const bip68 = require('bip68')

const keyPairAlice0 = bitcoin.ECPair.fromWIF(alice[0].wif, network)
const p2wpkhAlice0 = bitcoin.payments.p2wpkh({pubkey: keyPairAlice0.publicKey, network})

const keyPairBob0 = bitcoin.ECPair.fromWIF(bob[0].wif, network)

const sequence = bip68.encode({blocks: 5})

const witnessScript = csvCheckSigOutput(keyPairAlice0, keyPairBob0, sequence)
console.log('witnessScript  ', witnessScript.toString('hex'))

const p2wsh = bitcoin.payments.p2wsh({redeem: {output: witnessScript, network}, network})
console.log('P2WSH address  ', p2wsh.address)

const txb = new bitcoin.TransactionBuilder(network)

// We add the sequence number only if we want to run the first scenario
// txb.addInput(prevTx, input.vout, input.sequence, prevTxScript)
txb.addInput('TX_ID', TX_VOUT, [sequence])

txb.addOutput(p2wpkhAlice0.address, 999e5)

const tx = txb.buildIncomplete()

// hashForWitnessV0(inIndex, prevOutScript, value, hashType)
const signatureHash = tx.hashForWitnessV0(0, witnessScript, 1e8, hashType)

const witnessStackFirstBranch = bitcoin.payments.p2wsh({
  redeem: {
    input: bitcoin.script.compile([
      bitcoin.script.signature.encode(keyPairAlice0.sign(signatureHash), hashType),
      bitcoin.opcodes.OP_TRUE,
    ]),
    output: witnessScript
  }
}).witness

console.log('First branch witness stack  ', witnessStackFirstBranch.map(x => x.toString('hex')))

const witnessStackSecondBranch = bitcoin.payments.p2wsh({
  redeem: {
    input: bitcoin.script.compile([
      bitcoin.script.signature.encode(keyPairAlice0.sign(signatureHash), hashType),
      bitcoin.script.signature.encode(keyPairBob0.sign(signatureHash), hashType),
      bitcoin.opcodes.OP_FALSE
    ]),
    output: witnessScript
  }
}).witness

console.log('Second branch witness stack  ', witnessStackSecondBranch.map(x => x.toString('hex')))

// Choose a branch
tx.setWitness(0, witnessStackFirstBranch)
//tx.setWitness(0, witnessStackSecondBranch)

console.log('tx.toHex  ', tx.toHex())