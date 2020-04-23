const bitcoin = require('bitcoinjs-lib')
const { alice, bob } = require('./wallets.json')
const network = bitcoin.networks.regtest

// Signer
const keyPairAlice1 = bitcoin.ECPair.fromWIF(alice[1].wif, network)

// Redeem script
const p2wpkhAlice1 = bitcoin.payments.p2wpkh({pubkey: keyPairAlice1.publicKey, network})
const p2shAlice1 = bitcoin.payments.p2sh({redeem: p2wpkhAlice1, network})
const redeemScript = p2shAlice1.redeem.output.toString('hex')
console.log('Redeem script:')
console.log(redeemScript)

const psbt = new bitcoin.Psbt({network})
  .addInput({
    hash: 'TX_ID',
    index: TX_VOUT,
    witnessUtxo: {
      script: Buffer.from('a914' +
        bitcoin.crypto.hash160(Buffer.from('0014' + alice[1].pubKeyHash, 'hex')).toString('hex') +
        '87', 'hex'),
      value: 1e8,
    },
    redeemScript: Buffer.from(redeemScript, 'hex')
  })
  .addOutput({
    address: bob[1].p2wpkh,
    value: 999e5,
  })

psbt.signInput(0, keyPairAlice1)
psbt.validateSignaturesOfInput(0)

psbt.finalizeAllInputs()

console.log('Transaction hexadecimal:')
console.log(psbt.extractTransaction().toHex())