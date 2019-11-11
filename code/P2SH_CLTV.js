/**
 * You have to run this script twice!
 * After first run: take note the lockTime value and send coins to the P2SH address
 * Before second run: replace TX_ID, TX_VOUT and locktime
 * Generate 20 blocks
 * Send transaction
 * */

const bitcoin = require('bitcoinjs-lib')
const { alice, bob } = require('./wallets.json')
const network = bitcoin.networks.regtest
const hashType = bitcoin.Transaction.SIGHASH_ALL
const bip65 = require('bip65')


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


// Signers
const keyPairAlice1 = bitcoin.ECPair.fromWIF(alice[1].wif, network)
const keyPairBob1 = bitcoin.ECPair.fromWIF(bob[1].wif, network)

// Recipient
const p2wpkhAlice1 = bitcoin.payments.p2wpkh({pubkey: keyPairAlice1.publicKey, network})


// Replace the lockTime value on second run here!
//const lockTime = 1570264808
const lockTime = bip65.encode({utc: Math.floor(Date.now() / 1000) - (3600 * 6)})
console.log('lockTime  ', lockTime)


// Generate the redeem script
const redeemScript = cltvCheckSigOutput(keyPairAlice1, keyPairBob1, lockTime)
console.log('redeemScript  ', redeemScript.toString('hex'))


// Generate the P2SH address
const p2sh = bitcoin.payments.p2sh({redeem: {output: redeemScript, network}, network})
console.log('P2SH address  ', p2sh.address)


// Build transaction
const txb = new bitcoin.TransactionBuilder(network)

txb.setLockTime(lockTime)

// txb.addInput(prevTx, input.vout, input.sequence, prevTxScript)
txb.addInput('TX_ID', TX_VOUT, 0xfffffffe, null)
txb.addOutput(p2wpkhAlice1.address, 999e5)

const tx = txb.buildIncomplete()

// hashForWitnessV0(inIndex, prevOutScript, hashType)
const signatureHash = tx.hashForSignature(0, redeemScript, hashType)
console.log('signature hash: ', signatureHash.toString('hex'))


// Scenario 1
const inputScriptFirstBranch = bitcoin.payments.p2sh({
  redeem: {
    input: bitcoin.script.compile([
      bitcoin.script.signature.encode(keyPairAlice1.sign(signatureHash), hashType),
      bitcoin.opcodes.OP_TRUE,
    ]),
    output: redeemScript
  }
}).input

// Scenario 2
const inputScriptSecondBranch = bitcoin.payments.p2sh({
  redeem: {
    input: bitcoin.script.compile([
      bitcoin.script.signature.encode(keyPairAlice1.sign(signatureHash), hashType),
      bitcoin.script.signature.encode(keyPairBob1.sign(signatureHash), hashType),
      bitcoin.opcodes.OP_FALSE
    ]),
    output: redeemScript
  }
}).input

// Set the input script
tx.setInputScript(0, inputScriptFirstBranch)
//tx.setInputScript(0, inputScriptSecondBranch)


// Print
console.log('tx.toHex  ', tx.toHex())