const bitcoin = require('bitcoinjs-lib')
const { alice, bob } = require('./wallets.json')
const network = bitcoin.networks.regtest
const hashType = bitcoin.Transaction.SIGHASH_ALL
const bip68 = require('bip68')

// Redeem script
function csvCheckSigOutput(aQ, bQ, timelock) {
  return bitcoin.script.compile([
    bitcoin.opcodes.OP_IF,
    bitcoin.script.number.encode(timelock),
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

// Signers
const keyPairAlice1 = bitcoin.ECPair.fromWIF(alice[1].wif, network)
const keyPairBob1 = bitcoin.ECPair.fromWIF(bob[1].wif, network)

// Recipient
const p2wpkhAlice1 = bitcoin.payments.p2wpkh({pubkey: keyPairAlice1.publicKey, network})

// Set the timelock
const timelock = bip68.encode({blocks: 5})

// Generate the redeem script
const redeemScript = csvCheckSigOutput(keyPairAlice1, keyPairBob1, timelock)
console.log('redeemScript  ', redeemScript.toString('hex'))

// Generate the P2SH address
// Send 1 bitcoin to it
const p2sh = bitcoin.payments.p2sh({redeem: {output: redeemScript, network}, network})
console.log('p2sh.address  ', p2sh.address)


// Build the spending transaction
const txb = new bitcoin.TransactionBuilder(network)

// If we want to run the first scenario we set the timelock (sequence argument)
// txb.addInput(prevTxId, prevOutputIndex, sequence, prevTxScript)
txb.addInput('TX_ID', TX_VOUT, timelock)
txb.addOutput(p2wpkhAlice1.address, 999e5)

const tx = txb.buildIncomplete()

// Prepare the signature hash
const signatureHash = tx.hashForSignature(0, redeemScript, hashType)

// Set input script
const inputScriptFirstBranch = bitcoin.payments.p2sh({
  redeem: {
    input: bitcoin.script.compile([
      bitcoin.script.signature.encode(keyPairAlice1.sign(signatureHash), hashType),
      bitcoin.opcodes.OP_TRUE,
    ]),
    output: redeemScript
  },
}).input

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

// Choose a branch
tx.setInputScript(0, inputScriptFirstBranch)
//tx.setInputScript(0, inputScriptSecondBranch)

console.log('tx.toHex  ', tx.toHex())