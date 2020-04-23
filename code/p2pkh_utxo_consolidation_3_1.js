const bitcoin = require('bitcoinjs-lib')
const { alice } = require('./wallets.json')
const network = bitcoin.networks.regtest

const keyPairAlice1 = bitcoin.ECPair.fromWIF(alice[1].wif, network)
const keyPairAlice2 = bitcoin.ECPair.fromWIF(alice[2].wif, network)
const keyPairAlice3 = bitcoin.ECPair.fromWIF(alice[3].wif, network)

const nonWitnessUtxo = Buffer.from('TX_HEX', 'hex')

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
  .addOutput({
    address: alice[1].p2wpkh,
    value: 989e5,
  })

// For each input, we have to select the right keyPair to produce signatures that satisfy the locking scripts of the
// three UTXOs we are spending. We have this information by calling `gettransaction`.
psbt.signInput(0, keyPairAlice1)
psbt.signInput(1, keyPairAlice2)
psbt.signInput(2, keyPairAlice3)

psbt.validateSignaturesOfInput(0)
psbt.validateSignaturesOfInput(1)
psbt.validateSignaturesOfInput(2)

psbt.finalizeAllInputs()

console.log('Transaction hexadecimal:')
console.log(psbt.extractTransaction().toHex())