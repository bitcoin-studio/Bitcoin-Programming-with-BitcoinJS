const bitcoin = require('bitcoinjs-lib')
const { alice, bob, carol, dave, eve, mallory } = require('./wallets.json')
const network = bitcoin.networks.regtest

// Signer
const keyPairAlice1 = bitcoin.ECPair.fromWIF(alice[1].wif, network)

const psbt = new bitcoin.Psbt({network})
  .addInput({
    hash: 'TX_ID',
    index: TX_OUT,
    nonWitnessUtxo: Buffer.from('TX_HEX', 'hex')
  })
  .addOutput({
    address: bob[1].p2pkh,
    value: 2e7,
  })
  .addOutput({
    address: carol[1].p2pkh,
    value: 2e7,
  })
  .addOutput({
    address: dave[1].p2pkh,
    value: 2e7,
  })
  .addOutput({
    address: eve[1].p2pkh,
    value: 2e7,
  })
  .addOutput({
    address: mallory[1].p2pkh,
    value: 2e7,
  })

// Sign and validate
psbt.signInput(0, keyPairAlice1)
psbt.validateSignaturesOfInput(0)

// Finalize
psbt.finalizeAllInputs()

// Extract the tx and print tx hex
console.log('Transaction hexadecimal:')
console.log(psbt.extractTransaction().toHex())