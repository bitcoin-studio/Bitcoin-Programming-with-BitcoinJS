const bitcoin = require('bitcoinjs-lib')
const {alice} = require('./wallets.json')
const witnessStackToScriptWitness = require('./tools/witnessStackToScriptWitness')
const network = bitcoin.networks.regtest

const witnessScript = bitcoin.script.compile([
  bitcoin.opcodes.OP_ADD,
  bitcoin.opcodes.OP_5,
  bitcoin.opcodes.OP_EQUAL])

console.log('Witness script:')
console.log(witnessScript.toString('hex'))
console.log()

const p2wsh = bitcoin.payments.p2wsh({redeem: {output: witnessScript, network}, network})
const p2sh = bitcoin.payments.p2sh({redeem: p2wsh, network: network})
console.log('P2SH address:')
console.log(p2sh.address)
console.log()

// Create PSBT
const psbt = new bitcoin.Psbt({network})
  .addInput({
    hash: 'TX_ID',
    index: TX_VOUT,
    witnessUtxo: {
      script: Buffer.from('a914' +
        bitcoin.crypto.hash160(p2wsh.output).toString('hex') +
        '87', 'hex'),
      value: 1e8,
    },
    witnessScript: Buffer.from(witnessScript, 'hex')
  })
  .addOutput({
    address: alice[1].p2wpkh,
    value: 999e5,
  })

// Finalizing
const getFinalScripts = (inputIndex, input, script) => {
  // Step 1: Check to make sure the meaningful locking script matches what you expect.
  const decompiled = bitcoin.script.decompile(script)
  if (!decompiled || decompiled[0] !== bitcoin.opcodes.OP_ADD) {
    throw new Error(`Can not finalize input #${inputIndex}`)
  }

  // Step 2: Create final scripts
  const payment = bitcoin.payments.p2sh({
    redeem: bitcoin.payments.p2wsh({
      redeem: {
        output: script,
        input: bitcoin.script.compile([bitcoin.opcodes.OP_2, bitcoin.opcodes.OP_3]),
      }
    })
  })

  return {
    finalScriptSig: payment.input,
    finalScriptWitness:
      payment.witness && payment.witness.length > 0
        ? witnessStackToScriptWitness(payment.witness)
        : undefined
  }
}

psbt.finalizeInput(0, getFinalScripts)

console.log('Transaction hexadecimal:')
console.log(psbt.extractTransaction().toHex())