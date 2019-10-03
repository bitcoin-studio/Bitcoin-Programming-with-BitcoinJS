/**
 * Features
 * - Generate wallets (Alice, Bob, Carol, Dave Eve, Mallory)
 * - Create a json file with all cryptographic materials
 * - Import private keys to Bitcoin Core
 */

const { exec } = require('child_process')
const bitcoin = require('bitcoinjs-lib')
const bip32 = require('bip32')
const bip39 = require('bip39')
// Change the network appropriately (bitcoin, testnet, regtest)
const network = bitcoin.networks.regtest

// Replace these values if you want to
// 128 bit entropy will produce a 12 words mnemonic
// bx seed -b 128
const wallets = [
  {alice: '182301471f6892728ae56bb95b54396e'},
  {bob: '28c8b37e1462a460fafa440d3ec66d29'},
  {carol: '61628dbe355f4675d895d399b984aaf4'},
  {dave: '6dc790b775c765abbbd981c0cdbbce9e'},
  {eve: 'd8ec0331d6228a59b17cb412700761f0'},
  {mallory: '6af8462dd020ff7e2239a0a346d27448'}
]

// Create a json file with main info
let walletsJSON="{"

// Iterate on wallets
wallets.forEach((wallet, wallet_index) => {
  // Entropy
  let entropy = wallet[Object.keys(wallet)]
  console.log(`${Object.keys(wallet)} entropy  `, entropy)
  // Get mnemonic from entropy
  let mnemonic = bip39.entropyToMnemonic(wallet[Object.keys(wallet)])
  console.log(`${Object.keys(wallet)} mnemonic  `, mnemonic)
  // Get seed from mnemonic
  let seed = bip39.mnemonicToSeedSync(mnemonic)
  console.log(`${Object.keys(wallet)} seed  `, seed.toString('hex'))

  // Get master BIP32 master from seed
  let master = bip32.fromSeed(seed, network)

  // Get BIP32 extended private key
  let xprivMaster = master.toBase58()
  console.log(`${Object.keys(wallet)} master xpriv  `, xprivMaster)
  // Get master EC private key
  let privKeyMaster = master.privateKey.toString('hex')
  console.log(`${Object.keys(wallet)} master privKey  `, privKeyMaster)
  // Get private key WIF
  let wifMaster = master.toWIF()
  console.log(`${Object.keys(wallet)} master wif  `, wifMaster)

  // Get BIP32 extended master public key
  let xpubMaster = master.neutered().toBase58()
  console.log(`${Object.keys(wallet)} master xpub  `, xpubMaster)
  // Get master public key
  let pubKeyMaster =  master.publicKey.toString('hex')
  console.log(`${Object.keys(wallet)} master pubKey  `, pubKeyMaster)
  // Get master public key fingerprint
  let pubKeyFingerprintMaster = bitcoin.crypto.hash160(master.publicKey).slice(0,4).toString('hex')
  console.log(`${Object.keys(wallet)} master pubKey fingerprint `, pubKeyFingerprintMaster)
  console.log()

  // Add cryptographic materials to json file
  walletsJSON +=
    `"${Object.keys(wallet)}": [{
      "entropy": "${entropy}",
      "mnemonic": "${mnemonic}",
      "seed": "${seed.toString('hex')}", 
      "xprivMaster": "${xprivMaster}",
      "privKeyMaster": "${privKeyMaster}",
      "wifMaster": "${wifMaster}",
      "xpubMaster": "${xpubMaster}", 
      "pubKeyMaster": "${pubKeyMaster}",
      "pubKeyFingerprintMaster": "${pubKeyFingerprintMaster}"
    },`

  /**
   * We use the Bitcoin Core BIP32 derivation path
   * m/0'/0'/i'
   *
   * We derive 3 child nodes (keypairs, addresses, etc) per wallet
   */
  ;[...Array(3)].forEach((u, i) => {
    // Get child node
    let child = master.derivePath(`m/0'/0'/${i}'`)

    // Get child extended private key
    let xpriv = child.toBase58()
    console.log(`${Object.keys(wallet)} child ${i} xpriv  `, xpriv)
    // Get child EC private key
    let privKey = child.privateKey.toString('hex')
    console.log(`${Object.keys(wallet)} child ${i} privKey  `, privKey)
    // Get child wif private key
    let wif = child.toWIF()
    console.log(`${Object.keys(wallet)} child ${i} wif  `, wif)

    // Get child extended public key
    let xpub = child.neutered().toBase58()
    console.log(`${Object.keys(wallet)} child ${i} xpub  `, xpub)
    // Get child EC public key
    let pubKey =  child.publicKey.toString('hex')
    console.log(`${Object.keys(wallet)} child ${i} pubKey  `, pubKey)
    // Get child EC public key hash
    let pubKeyHash = bitcoin.crypto.hash160(child.publicKey).toString('hex')
    console.log(`${Object.keys(wallet)} child ${i} pubKey hash `, pubKeyHash)
    // Get child EC public key fingerprint
    let pubKeyFingerprint = bitcoin.crypto.hash160(child.publicKey).slice(0,4).toString('hex')
    console.log(`${Object.keys(wallet)} child ${i} pubKey fingerprint `, pubKeyFingerprint)

    // Addresses
    // P2PKH
    let p2pkh = bitcoin.payments.p2pkh({pubkey: child.publicKey, network}).address
    console.log(`${Object.keys(wallet)} child ${i} address p2pkh  `, p2pkh)
    // P2WPKH
    let p2wpkh = bitcoin.payments.p2wpkh({pubkey: child.publicKey, network})
    let p2wpkhAddress = p2wpkh.address
    console.log(`${Object.keys(wallet)} child ${i} address p2wpkh  `, p2wpkhAddress)
    // P2SH-P2WPKH
    let p2sh_p2wpkh = bitcoin.payments.p2sh({redeem: p2wpkh, network}).address
    console.log(`${Object.keys(wallet)} child ${i} address p2sh-p2wpkh  `, p2sh_p2wpkh)
    console.log()

    walletsJSON +=
      `{
          "xpriv": "${xpriv}",
          "privKey": "${privKey}",
          "wif": "${wif}", 
          "xpub": "${xpub}",
          "pubKey": "${pubKey}", 
          "pubKeyHash": "${pubKeyHash}",
          "pubKeyFingerprint": "${pubKeyFingerprint}",
          "p2pkh": "${p2pkh}", 
          "p2sh-p2wpkh": "${p2sh_p2wpkh}", 
          "p2wpkh": "${p2wpkhAddress}"
        }`

    // Add comma for all derivations but not last
    if (i < 2) walletsJSON += `,`
  })

  // No comma for last wallet
  wallet_index === 5 ? walletsJSON+="]}" : walletsJSON+="],"
  console.log()
})


exec(
  // Write the json file
  `echo '${walletsJSON}' | jq . > wallets.json`, (error, stdout, stderr) => {
    if (error) {
      console.error('stderr', stderr)
      throw error
    }
    stdout && console.log(stdout)
    console.log('wallets.json has been written successfully')

    // Import private keys to Bitcoin Core
    exec('./import_privkeys.sh', (error, stdout, stderr) => {
      if (error) {
        console.error('stderr', stderr)
        throw error
      }
      stdout && console.log(stdout)
      console.log('Private keys have been imported to Bitcoin Core successfully')
    })
  })