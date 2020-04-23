/**
 * You have to run this script twice.
 * First run is to get a lockTime, and send coins to the P2WSH address that depends on this locktime
 * Before second run: replace TX_ID, TX_VOUT, TX_HEX and locktime
 * Second run
 * Generate 20 blocks
 * Send transaction
 * */

const bitcoin = require('bitcoinjs-lib')
const { alice, bob } = require('./wallets.json')
const witnessStackToScriptWitness = require('./tools/witnessStackToScriptWitness')
const network = bitcoin.networks.regtest
const bip65 = require('bip65')

// Witness script
function cltvCheckSigOutput(aQ, bQ, lockTime) {
  return bitcoin.script.fromASM(
    `
      OP_IF
          ${bitcoin.script.number.encode(lockTime).toString('hex')}
          OP_CHECKLOCKTIMEVERIFY
          OP_DROP
      OP_ELSE
          ${bQ.publicKey.toString('hex')}
          OP_CHECKSIGVERIFY
      OP_ENDIF
      ${aQ.publicKey.toString('hex')}
      OP_CHECKSIG
    `
      .trim()
      .replace(/\s+/g, ' '),
  );
}

// Signers
const keyPairAlice1 = bitcoin.ECPair.fromWIF(alice[1].wif, network)
const keyPairBob1 = bitcoin.ECPair.fromWIF(bob[1].wif, network)

// Replace the lockTime value on second run here!
//const lockTime = 1587620416
const lockTime = bip65.encode({utc: Math.floor(Date.now() / 1000) - (3600 * 6)})
console.log('Timelock in UNIX timestamp:')
console.log(lockTime)

// Generate witness script and P2WSH address
const witnessScript = cltvCheckSigOutput(keyPairAlice1, keyPairBob1, lockTime)
console.log('Witness script:')
console.log(witnessScript.toString('hex'))

const p2wsh = bitcoin.payments.p2wsh({redeem: {output: witnessScript, network}, network})
console.log('P2WSH address:')
console.log(p2wsh.address)

// Create PSBT
const psbt = new bitcoin.Psbt({network})

// Only necessary for scenario 1
psbt.setLocktime(lockTime)

psbt
  .addInput({
    hash: 'TX_ID',
    index: TX_VOUT,
    sequence: 0xfffffffe,
    witnessUtxo: {
      script: Buffer.from('0020' +
        bitcoin.crypto.sha256(witnessScript).toString('hex'),
        'hex'),
      value: 1e8,
    },
    witnessScript: witnessScript
  })
  .addOutput({
    address: alice[1].p2wpkh,
    value: 999e5,
  })

psbt.signInput(0, keyPairAlice1)

// Only necessary for scenario 2
//psbt.signInput(0, keyPairBob1)

// Finalizing
const getFinalScripts = (inputIndex, input, script) => {
  // Step 1: Check to make sure the meaningful locking script matches what you expect.
  const decompiled = bitcoin.script.decompile(script)
  if (!decompiled || decompiled[0] !== bitcoin.opcodes.OP_IF) {
    throw new Error(`Can not finalize input #${inputIndex}`)
  }

  // Step 2: Create final scripts
  // Scenario 1
  const paymentFirstBranch = bitcoin.payments.p2wsh({
    redeem: {
      input: bitcoin.script.compile([
        input.partialSig[0].signature,
        bitcoin.opcodes.OP_TRUE,
      ]),
      output: witnessScript
    }
  })

  console.log('First branch witness stack:')
  console.log(paymentFirstBranch.witness.map(x => x.toString('hex')))


  // Scenario 2
  /*
  const paymentSecondBranch = bitcoin.payments.p2wsh({
    redeem: {
      input: bitcoin.script.compile([
        input.partialSig[0].signature,
        input.partialSig[1].signature,
        bitcoin.opcodes.OP_FALSE
      ]),
      output: witnessScript
    }
  })

  console.log('Second branch witness stack:')
  console.log(paymentSecondBranch.witness.map(x => x.toString('hex')))
  */

  return {
    finalScriptWitness: witnessStackToScriptWitness(paymentFirstBranch.witness)
  }
}

psbt.finalizeInput(0, getFinalScripts)

console.log('Transaction hexadecimal:')
console.log(psbt.extractTransaction().toHex())