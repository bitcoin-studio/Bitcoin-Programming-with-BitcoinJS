const bitcoin = require('bitcoinjs-lib')
const { alice, bob, carol, dave, eve, mallory } = require('./wallets.json')
const network = bitcoin.networks.regtest

// Signers
const keyPairAlice1 = bitcoin.ECPair.fromWIF(alice[1].wif, network)
const keyPairCarol1 = bitcoin.ECPair.fromWIF(carol[1].wif, network)
const keyPairEve1 = bitcoin.ECPair.fromWIF(eve[1].wif, network)
const keyPairMallory1 = bitcoin.ECPair.fromWIF(mallory[1].wif, network)

const nonWitnessUtxo =  Buffer.from('TX_HEX', 'hex')

const psbt = new bitcoin.Psbt({network})
  .addInput({
    hash: 'TX_ID',
    index: TX_OUT,
    nonWitnessUtxo
  })
  .addInput({
    hash: 'TX_ID',
    index: TX_OUT,
    nonWitnessUtxo
  })
  .addInput({
    hash: 'TX_ID',
    index: TX_OUT,
    nonWitnessUtxo
  })
  .addInput({
    hash: 'TX_ID',
    index: TX_OUT,
    nonWitnessUtxo
  })
  .addOutput({
    address: bob[1].p2pkh,
    value: 2e7,
  })
  .addOutput({
    address: dave[1].p2pkh,
    value: 2e7,
  })
  .addOutput({
    address: mallory[2].p2pkh,
    value: 2e7,
  })
  .addOutput({
    address: alice[2].p2pkh,
    value: 2e7,
  })
  .addOutput({
    address: eve[1].p2pkh,
    value: 5e6 - 5e4,
  })
  .addOutput({
    address: mallory[1].p2pkh,
    value: 1e7 - 5e4,
  })

// Sign
// Make sure each signer signs its own input
psbt.signInput(0, keyPairAlice1)
psbt.signInput(1, keyPairCarol1)
psbt.signInput(2, keyPairEve1)
psbt.signInput(3, keyPairMallory1)

psbt.validateSignaturesOfInput(0)
psbt.validateSignaturesOfInput(1)
psbt.validateSignaturesOfInput(2)
psbt.validateSignaturesOfInput(3)

// Finalize
psbt.finalizeAllInputs()

// Extract the tx and print tx hex
console.log('Transaction hexadecimal:')
console.log(psbt.extractTransaction().toHex())