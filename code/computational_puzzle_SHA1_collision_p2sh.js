const bitcoin = require('bitcoinjs-lib')
const { alice } = require('./wallets.json')
const network = bitcoin.networks.regtest

// Redeem script and P2SH address
const redeemScript = bitcoin.script.compile([
  bitcoin.opcodes.OP_2DUP,
  bitcoin.opcodes.OP_EQUAL,
  bitcoin.opcodes.OP_NOT,
  bitcoin.opcodes.OP_VERIFY,
  bitcoin.opcodes.OP_SHA1,
  bitcoin.opcodes.OP_SWAP,
  bitcoin.opcodes.OP_SHA1,
  bitcoin.opcodes.OP_EQUAL])

console.log('Redeem script:')
console.log(redeemScript.toString('hex'))

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

const value_1 = '255044462d312e330a25e2e3cfd30a0a0a312030206f626a0a3c3c2f57696474682032203020522f4865696768742033203020522f547970652034203020522f537562747970652035203020522f46696c7465722036203020522f436f6c6f7253706163652037203020522f4c656e6774682038203020522f42697473506572436f6d706f6e656e7420383e3e0a73747265616d0affd8fffe00245348412d3120697320646561642121212121852fec092339759c39b1a1c63c4c97e1fffe017f46dc93a6b67e013b029aaa1db2560b45ca67d688c7f84b8c4c791fe02b3df614f86db1690901c56b45c1530afedfb76038e972722fe7ad728f0e4904e046c230570fe9d41398abe12ef5bc942be33542a4802d98b5d70f2a332ec37fac3514e74ddc0f2cc1a874cd0c78305a21566461309789606bd0bf3f98cda8044629a1'
const value_2 = '255044462d312e330a25e2e3cfd30a0a0a312030206f626a0a3c3c2f57696474682032203020522f4865696768742033203020522f547970652034203020522f537562747970652035203020522f46696c7465722036203020522f436f6c6f7253706163652037203020522f4c656e6774682038203020522f42697473506572436f6d706f6e656e7420383e3e0a73747265616d0affd8fffe00245348412d3120697320646561642121212121852fec092339759c39b1a1c63c4c97e1fffe017346dc9166b67e118f029ab621b2560ff9ca67cca8c7f85ba84c79030c2b3de218f86db3a90901d5df45c14f26fedfb3dc38e96ac22fe7bd728f0e45bce046d23c570feb141398bb552ef5a0a82be331fea48037b8b5d71f0e332edf93ac3500eb4ddc0decc1a864790c782c76215660dd309791d06bd0af3f98cda4bc4629b1'

// Finalizing
const getFinalScripts = (inputIndex, input, script) => {
  // Step 1: Check to make sure the meaningful locking script matches what you expect.
  const decompiled = bitcoin.script.decompile(script)
  if (!decompiled || decompiled[0] !== bitcoin.opcodes.OP_2DUP) {
    throw new Error(`Can not finalize input #${inputIndex}`)
  }

  // Step 2: Create final scripts
  const payment = bitcoin.payments.p2sh({
    redeem: {
      output: script,
      input: bitcoin.script.compile([
        Buffer.from(value_1, 'hex'),
        Buffer.from(value_2, 'hex'),
      ]),
    },
  })

  return {
    finalScriptSig: payment.input
  }
}

psbt.finalizeInput(0, getFinalScripts)

console.log('Transaction hexadecimal:')
console.log(psbt.extractTransaction().toHex())