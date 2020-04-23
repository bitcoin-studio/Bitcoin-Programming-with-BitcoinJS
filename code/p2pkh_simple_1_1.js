const bitcoin = require('bitcoinjs-lib')
const { alice, bob } = require('./wallets.json')
const network = bitcoin.networks.regtest

const keyPairAlice1 = bitcoin.ECPair.fromWIF(alice[1].wif, network)

const psbt = new bitcoin.Psbt({network})
  .addInput({
    hash: 'TX_ID',
    index: TX_OUT,
    nonWitnessUtxo: Buffer.from('TX_HEX', 'hex')
  })
  .addOutput({
    address: bob[1].p2pkh,
    value: 999e5,
  })

psbt.signInput(0, keyPairAlice1)
psbt.validateSignaturesOfInput(0)
psbt.finalizeAllInputs()

console.log('Transaction hexadecimal:')
console.log(psbt.extractTransaction().toHex())