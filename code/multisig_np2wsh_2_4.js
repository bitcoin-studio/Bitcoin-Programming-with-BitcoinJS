const bitcoin = require('bitcoinjs-lib')
const {alice, bob, carol, dave} = require('./wallets.json')
const network = bitcoin.networks.regtest

// Witness script and address
const p2ms = bitcoin.payments.p2ms({
  m: 2, pubkeys: [
    Buffer.from(alice[1].pubKey, 'hex'),
    Buffer.from(bob[1].pubKey, 'hex'),
    Buffer.from(carol[1].pubKey, 'hex'),
    Buffer.from(dave[1].pubKey, 'hex'),
  ], network})

console.log('Witness script:')
console.log(p2ms.output.toString('hex'))
console.log()

// In the funding tx locking script
console.log('HASH160(SHA256(witness script)):')
const hash160sha256 = bitcoin.crypto.hash160(
  Buffer.from('0020' + bitcoin.crypto.sha256(p2ms.output).toString('hex'),
    'hex'))
console.log(hash160sha256.toString('hex'))
console.log()

const p2wsh = bitcoin.payments.p2wsh({redeem: p2ms, network})
const p2sh = bitcoin.payments.p2sh({redeem: p2wsh, network})
console.log('P2SH address:')
console.log(p2sh.address)
console.log()

// Build transaction
const psbt = new bitcoin.Psbt({network})
  .addInput({
    hash: 'TX_ID',
    index: TX_VOUT,
    redeemScript: Buffer.from('0020' + bitcoin.crypto.sha256(p2ms.output).toString('hex'), 'hex'),
    witnessScript: p2wsh.redeem.output,
    witnessUtxo: {
      script: Buffer.from('a914' + hash160sha256.toString('hex') + '87', 'hex'),
      value: 1e8,
    }
  })
  .addOutput({
    address: alice[2].p2wpkh,
    value: 999e5,
  })

// Signing
const keyPairAlice1 = bitcoin.ECPair.fromWIF(alice[1].wif, network)
const keyPairBob1 = bitcoin.ECPair.fromWIF(bob[1].wif, network)

psbt
  .signInput(0, keyPairAlice1)
  .signInput(0, keyPairBob1)

// Finalizing
psbt.validateSignaturesOfInput(0, Buffer.from(alice[1].pubKey, 'hex'))
psbt.validateSignaturesOfInput(0, Buffer.from(bob[1].pubKey, 'hex'))

psbt.finalizeAllInputs()

// Extracting and printing
console.log('Transaction hexadecimal:')
console.log(psbt.extractTransaction().toHex())