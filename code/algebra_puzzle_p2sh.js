const bitcoin = require('bitcoinjs-lib')
const {alice} = require('./wallets.json')
const network = bitcoin.networks.regtest

const redeemScript = bitcoin.script.compile([
  bitcoin.opcodes.OP_ADD,
  bitcoin.opcodes.OP_5,
  bitcoin.opcodes.OP_EQUAL])

console.log('Redeem script:')
console.log(redeemScript.toString('hex'))
console.log()

const p2sh = bitcoin.payments.p2sh({redeem: {output: redeemScript, network}, network})
console.log('P2SH address:')
console.log(p2sh.address)
console.log()

// Create PSBT
const psbt = new bitcoin.Psbt({network})
  .addInput({
    hash: 'TX_ID',
    index: TX_VOUT,
    nonWitnessUtxo: Buffer.from('TX_HEX', 'hex'),
    redeemScript: Buffer.from(redeemScript, 'hex')
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
    redeem: {
      output: script,
      input: bitcoin.script.compile([bitcoin.opcodes.OP_2, bitcoin.opcodes.OP_3]),
    },
  })

  return {
    finalScriptSig: payment.input
  }
}

psbt.finalizeInput(0, getFinalScripts)

console.log('Transaction hexadecimal:')
console.log(psbt.extractTransaction().toHex())