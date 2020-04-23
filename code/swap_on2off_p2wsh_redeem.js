// Import dependencies
const bitcoin = require('bitcoinjs-lib')
const { alice, bob } = require('./wallets.json')
const witnessStackToScriptWitness = require('./tools/witnessStackToScriptWitness')
const network = bitcoin.networks.regtest
const bip65 = require('bip65')

// Variables
const TX_ID = ''
const TX_VOUT = 0
const PREIMAGE = ''
const TIMELOCK = 0
const WITNESS_SCRIPT = ''
const IS_REFUND = false

// Signers
const keyPairUser = bitcoin.ECPair.fromWIF(alice[1].wif, network)
const keyPairSwapProvider = bitcoin.ECPair.fromWIF(bob[1].wif, network)

// Generate bitcoin addresses
const p2wpkhSwapProvider = bitcoin.payments.p2wpkh({pubkey: keyPairSwapProvider.publicKey, network})
console.log('Swap provider redeem address:')
console.log(p2wpkhSwapProvider.address)
console.log()

const p2wpkhUser = bitcoin.payments.p2wpkh({pubkey: keyPairUser.publicKey, network})
console.log('User redeem address:')
console.log(p2wpkhUser.address)
console.log()

// Create PSBT
const psbt = new bitcoin.Psbt({network})

// Set timelock if refund case
if (IS_REFUND) {
  const timelock = bip65.encode({blocks: TIMELOCK})
  psbt.setLocktime(timelock)
  console.log('Timelock expressed in block height:')
  console.log(timelock)
  console.log()
}

// Add input
psbt
  .addInput({
    hash: TX_ID,
    index: TX_VOUT,
    sequence: 0xfffffffe,
    witnessUtxo: {
      script: Buffer.from('0020' +
        bitcoin.crypto.sha256(Buffer.from(WITNESS_SCRIPT, 'hex')).toString('hex'),
        'hex'),
      value: 12e2
    },
    witnessScript: Buffer.from(WITNESS_SCRIPT, 'hex')
  })

// Add outputs
if (!IS_REFUND) {
  // Happy case: swap provider redeems the funds to his address.
  psbt
    .addOutput({
      address: p2wpkhSwapProvider.address,
      value: 1e3,
    })
} else {
  // Refund case: the user redeems the funds to his address
  psbt
    .addOutput({
      address: p2wpkhUser.address,
      value: 1e3,
    })
}

if (!IS_REFUND) {
// Only in happy case
  psbt.signInput(0, keyPairSwapProvider)
} else {
  // Only in refund case
  psbt.signInput(0, keyPairUser)
}

// Finalizing
const getFinalScripts = (inputIndex, input, script) => {
  // Step 1: Check to make sure the meaningful locking script matches what you expect.
  const decompiled = bitcoin.script.decompile(script)
  if (!decompiled || decompiled[0] !== bitcoin.opcodes.OP_HASH160) {
    throw new Error(`Can not finalize input #${inputIndex}`)
  }

  // Step 2: Create final scripts
  if (!IS_REFUND) {
    // Happy case: Swap Provider is able to spend the P2WSH
    const witnessStackClaimBranch = bitcoin.payments.p2wsh({
      redeem: {
        input: bitcoin.script.compile([
          input.partialSig[0].signature,
          Buffer.from(PREIMAGE, 'hex'),
        ]),
        output: Buffer.from(WITNESS_SCRIPT, 'hex')
      }
    })
    console.log('First branch witness stack:')
    console.log(witnessStackClaimBranch.witness.map(x => x.toString('hex')))

    return {
      finalScriptWitness: witnessStackToScriptWitness(witnessStackClaimBranch.witness)
    }
  } else {
    // Failure case: User ask a refund after the timelock has expired
    const witnessStackRefundBranch = bitcoin.payments.p2wsh({
      redeem: {
        input: bitcoin.script.compile([
          input.partialSig[0].signature,
          Buffer.from('', 'hex'),
        ]),
        output: Buffer.from(WITNESS_SCRIPT, 'hex')
      }
    })
    console.log('Second branch witness stack:')
    console.log(witnessStackRefundBranch.witness.map(x => x.toString('hex')))

    return {
      finalScriptWitness: witnessStackToScriptWitness(witnessStackRefundBranch.witness)
    }
  }
}

psbt.finalizeInput(0, getFinalScripts)

// Preimage's HASH160
console.log('Preimage\'s HASH160')
console.log(bitcoin.crypto.hash160(Buffer.from(PREIMAGE, 'hex')).toString('hex'))
console.log()

// Print
console.log('Transaction hexadecimal:')
console.log(psbt.extractTransaction().toHex())
