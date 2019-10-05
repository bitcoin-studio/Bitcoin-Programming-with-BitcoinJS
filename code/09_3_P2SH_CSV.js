/**
 * You have to run this script twice!
 * After first run: take note the lockTime value and send coins to the P2SH address
 * Before second run: replace TX_ID, TX_VOUT and locktime
 * Generate 20 blocks
 * Send transaction
 * */

//
const bitcoin = require('bitcoinjs-lib')
const { alice, bob } = require('./wallets.json')
const network = bitcoin.networks.regtest
const hashType = bitcoin.Transaction.SIGHASH_ALL
const bip68 = require('bip68')

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



const keyPairAlice0 = bitcoin.ECPair.fromWIF(alice[0].wif, network)
const p2wpkhAlice0 = bitcoin.payments.p2wpkh({pubkey: keyPairAlice0.publicKey, network})

const keyPairBob0 = bitcoin.ECPair.fromWIF(bob[0].wif, network)

const sequence = bip68.encode({blocks: 5})

const redeemScript = csvCheckSigOutput(keyPairAlice0, keyPairBob0, sequence)
console.log('redeemScript  ', redeemScript.toString('hex'))

const p2sh = bitcoin.payments.p2sh({redeem: {output: redeemScript, network}, network})
console.log('p2sh.address  ', p2sh.address)

const txb = new bitcoin.TransactionBuilder(network)

// We add the sequence number only if we want to run the first scenario
// txb.addInput(prevTxId, prevOutputIndex, sequence, prevTxScript)
txb.addInput('TX_ID', TX_VOUT, [sequence])

txb.addOutput(p2wpkhAlice0.address, 999e5)

const tx = txb.buildIncomplete()

const signatureHash = tx.hashForSignature(0, redeemScript, hashType)

const inputScriptFirstBranch = bitcoin.payments.p2sh({
  redeem: {
    input: bitcoin.script.compile([
      bitcoin.script.signature.encode(keyPairAlice0.sign(signatureHash), hashType),
      bitcoin.opcodes.OP_TRUE,
    ]),
    output: redeemScript
  },
}).input

const inputScriptSecondBranch = bitcoin.payments.p2sh({
  redeem: {
    input: bitcoin.script.compile([
      bitcoin.script.signature.encode(keyPairAlice0.sign(signatureHash), hashType),
      bitcoin.script.signature.encode(keyPairBob0.sign(signatureHash), hashType),
      bitcoin.opcodes.OP_FALSE
    ]),
    output: redeemScript
  }
}).input

// Choose a branch
tx.setInputScript(0, inputScriptFirstBranch)
//tx.setInputScript(0, inputScriptSecondBranch)

console.log('tx.toHex  ', tx.toHex())