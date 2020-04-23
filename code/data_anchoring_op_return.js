const bitcoin = require('bitcoinjs-lib')
const { alice } = require('./wallets.json')
const network = bitcoin.networks.regtest

const keyPairAlice1 = bitcoin.ECPair.fromWIF(alice[1].wif, network)

const psbt = new bitcoin.Psbt({network})

psbt
  .addInput({
    hash: 'TX_ID',
    index: TX_VOUT,
    witnessUtxo: {
      script: Buffer.from('0014' + alice[1].pubKeyHash, 'hex'),
      value: 1e8,
    },
  })

const data = Buffer.from('Programmable money FTW', 'utf8')
const embed = bitcoin.payments.embed({data: [data]})

psbt
  .addOutput({
    script: embed.output,
    value: 0,
  })
  .addOutput({
    address: alice[1].p2wpkh,
    value: 999e5,
})

psbt.signInput(0, keyPairAlice1)

psbt.validateSignaturesOfInput(0)
psbt.finalizeAllInputs()

console.log('Transaction hexadecimal:')
console.log(psbt.extractTransaction().toHex())