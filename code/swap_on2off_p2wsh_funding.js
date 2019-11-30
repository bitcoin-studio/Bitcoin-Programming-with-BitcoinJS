const bitcoin = require('bitcoinjs-lib')
const { alice, bob } = require('./wallets.json')
const network = bitcoin.networks.regtest
const bip65 = require('bip65')

// Variables
const TIMELOCK = 0
const PAYMENT_HASH = ''

// Swap contract
const swapContractGenerator = function(claimPublicKey, refundPublicKey, preimageHash, cltv) {
  return bitcoin.script.compile([
    bitcoin.opcodes.OP_HASH160,
    bitcoin.crypto.ripemd160(Buffer.from(PAYMENT_HASH, 'hex')),
    bitcoin.opcodes.OP_EQUAL,
    bitcoin.opcodes.OP_IF,
    claimPublicKey,
    bitcoin.opcodes.OP_ELSE,
    bitcoin.script.number.encode(cltv),
    bitcoin.opcodes.OP_CHECKLOCKTIMEVERIFY,
    bitcoin.opcodes.OP_DROP,
    refundPublicKey,
    bitcoin.opcodes.OP_ENDIF,
    bitcoin.opcodes.OP_CHECKSIG,
  ])
}

// Signers
const keyPairUser = bitcoin.ECPair.fromWIF(alice[1].wif, network)
const keyPairSwapProvider = bitcoin.ECPair.fromWIF(bob[1].wif, network)

// Timelock
const timelock = bip65.encode({ blocks: TIMELOCK })
console.log('Timelock expressed in block height:')
console.log(timelock)
console.log()

// Generate swap contract
const swapContract =  swapContractGenerator(keyPairSwapProvider.publicKey, keyPairUser.publicKey, PAYMENT_HASH, timelock)
console.log('Swap contract (witness script):')
console.log(swapContract.toString('hex'))
console.log()

// Swap contract's SHA256 hash
console.log('Swap contract\'s SHA256 hash:')
console.log(bitcoin.crypto.sha256(swapContract).toString('hex'))
console.log()

// Generate swap contract bitcoin address
const p2wsh = bitcoin.payments.p2wsh({redeem: {output: swapContract, network}, network})
console.log('P2WSH swap smart contract address:')
console.log(p2wsh.address)
