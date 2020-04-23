const bitcoin = require('bitcoinjs-lib')
const {alice, bob} = require('./wallets.json')
const network = bitcoin.networks.regtest

// Signer
const keyPairAlice1 = bitcoin.ECPair.fromWIF(alice[1].wif, network)

//The SCRIPT_PUBKEY can be generated like so
//const p2wpkhAlice1 = bitcoin.payments.p2wpkh({pubkey: keyPairAlice1.publicKey, network})
//console.log('Previous output script:')
//console.log(p2wpkhAlice1.output.toString('hex'))

const psbt = new bitcoin.Psbt({network})
  .addInput({
    hash: 'TX_ID',
    index: TX_VOUT,
    witnessUtxo: {
      script: Buffer.from('0014' + alice[1].pubKeyHash, 'hex'),
      value: 1e8,
    },
  })
  .addOutput({
    address: bob[1].p2wpkh,
    value: 5e7,
  })
  .addOutput({
    address: alice[1].p2wpkh,
    value: 499e5,
  })

psbt.signInput(0, keyPairAlice1)

psbt.validateSignaturesOfInput(0)
psbt.finalizeAllInputs()

console.log('Transaction hexadecimal:')
console.log(psbt.extractTransaction().toHex())