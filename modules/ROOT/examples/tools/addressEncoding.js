const bitcoin = require('bitcoinjs-lib')
const bs58 = require('bs58')
// Change the network appropriately (bitcoin, testnet, regtest)
const network = bitcoin.networks.regtest

/**
 * Creating a P2PKH address in Base58Check encoding from the public key hash
 * @ECPubKeyHash HASH160 of the public key
 */
function Base58CheckEncodeP2PKH(ECPubKeyHash) {
  if (typeof ECPubKeyHash === 'string' || ECPubKeyHash instanceof String) {
    ECPubKeyHash = Buffer.from(ECPubKeyHash, 'hex')
  }
  console.log('ECPubKeyHash --', ECPubKeyHash)
  // 1 byte Version (network, address type, coin) + 20 bytes Public key hash
  let versionAndHash160 = Buffer.concat([Buffer.alloc(1, network.pubKeyHash), ECPubKeyHash])
  console.log('versionAndHash160 --', versionAndHash160)
  let doubleSHA = bitcoin.crypto.hash256(versionAndHash160)
  console.log('doubleSHA --', doubleSHA)
  // Take the first 4 bytes
  let addressChecksum = doubleSHA.slice(0, 4)
  console.log('Address checksum --', addressChecksum)
  // Append the checksum at the end
  let unencodedAddress = Buffer.concat([versionAndHash160, addressChecksum])
  console.log('Unencoded address --', unencodedAddress)
  // Encode in Base58
  let address = bs58.encode(unencodedAddress)
  console.log('P2PKH address --', address)
}

/**
 * Retrieving the public key hash from a Base58Check P2PKH address
 * @address P2PKH address
 */
function Base58CheckDecodeP2PKH(address) {
  let decodedAddress = bs58.decode(address)
  console.log('Decoded address --', decodedAddress)
  // Extract the public key hash (20 bytes after the 1 byte version)
  let pubKeyHash = decodedAddress.slice(1, 21)
  console.log('pubKeyHash buffer --', pubKeyHash)
  console.log('pubKeyHash hex string --', pubKeyHash.toString('hex'))
  return pubKeyHash
}

module.exports =  { Base58CheckEncodeP2PKH, Base58CheckDecodeP2PKH }