// You have to run this script twice
// First run: note the lockTime value and send coin to the P2SH address
// Then hardcode your lockTime value before second run

function cltvCheckSigOutput (aQ, bQ, lockTime) {
  return bitcoin.script.compile([
    bitcoin.opcodes.OP_IF,
    bitcoin.script.number.encode(lockTime),
    bitcoin.opcodes.OP_CHECKLOCKTIMEVERIFY,
    bitcoin.opcodes.OP_DROP,

    bitcoin.opcodes.OP_ELSE,
    bQ.publicKey,
    bitcoin.opcodes.OP_CHECKSIGVERIFY,
    bitcoin.opcodes.OP_ENDIF,

    aQ.publicKey,
    bitcoin.opcodes.OP_CHECKSIG
  ])
}

const bitcoin = require('bitcoinjs-lib')
const { alice, bob } = require('./wallets.json')
const network = bitcoin.networks.regtest
const hashType = bitcoin.Transaction.SIGHASH_ALL

const bip65 = require('bip65')

const keyPairAlice0 = bitcoin.ECPair.fromWIF(alice[0].wif, network)
const p2wpkhAlice0 = bitcoin.payments.p2wpkh({pubkey: keyPairAlice0.publicKey, network})

const keyPairBob0 = bitcoin.ECPair.fromWIF(bob[0].wif, network)

// Replace the lockTime value on second run
const lockTime = bip65.encode({utc: Math.floor(Date.now() / 1000) - (3600 * 6)})
console.log('lockTime  ', lockTime)

const redeemScript = cltvCheckSigOutput(keyPairAlice0, keyPairBob0, lockTime)
console.log('redeemScript  ', redeemScript.toString('hex'))

const p2sh = bitcoin.payments.p2sh({redeem: {output: redeemScript, network}, network})
console.log('P2SH address  ', p2sh.address)

const txb = new bitcoin.TransactionBuilder(network)

txb.setLockTime(lockTime)

// txb.addInput(prevTx, input.vout, input.sequence, prevTxScript)
txb.addInput('TX_ID', TX_VOUT, 0xfffffffe)

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
  }
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