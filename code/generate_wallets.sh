#!/usr/bin/env bash
# This shebang line will use the first bash in your PATH, which should be 4.x
# Bash 4.x is required for this script

# Libbitcoin-explorer (bx)
# Configure bx.cfg config file to testnet values for testnet
# Not all commands accept --version option

# Associative arrays are stored in a 'hash' order, so no ordering.
# Name: entropy
# Create a new entropy for each wallet with `bx seed`
declare -A wallets=(
    ["alice"]="dfa9ce0aec1babbb22ff0c57d3554a52307dfa0d83b4808d"
    ["bob"]="21ba1480ea0c7d10b7ca21c4565dd1c7240e64d21f6e7620"
    ["carol"]="6a824a9a95f98fed84301f96d0bc5538e2e92de912b79faa"
)

# Push wif, pubKey, address in a JSON
walletsJSON="{"

for name in "${!wallets[@]}"
do
  echo "$name wallet"

  # Construct walletJSON
  walletsJSON+=''' "'$name'": ['''

  # The Base16 entropy from which the mnemonic is created. The length must be evenly divisible by 32 bits
  entropy=${wallets[${name}]}
  echo "$name entropy: $entropy"

  mnemonic="$(bx mnemonic-new ${entropy})"
  echo "$name mnemonic: $mnemonic"

  seed="$(bx mnemonic-to-seed ${mnemonic})"
  echo "$name seed: $seed"

  # Create testnet HD (BIP32) private key
  xprivKey="$(bx hd-new ${seed})"
  echo "$name master xprivKey: $xprivKey"

  # Derive the testnet HD (BIP32) public key of a HD private key
  xpubKey="$(bx hd-to-public ${xprivKey})"
  echo "$name master xpubKey: $xpubKey"
  echo

  # Derive 4 addresses
  for value in {0..3}
  do
    # Derived private key: m/0'/0'/$value'
    derivedPrivKey="$(bx hd-private -d -i 0 ${xprivKey} |  bx hd-private -d -i 0 |  bx hd-private -d -i ${value})"
    echo "$name derivedPrivKey $value: $derivedPrivKey"

    # Private key (WIF)
    wif="$(bx hd-to-ec ${derivedPrivKey} | bx ec-to-wif)"
    echo "$name wif $value: $wif"
    echo "import private key to Bitcoin Core..."
    echo "autogen_${name}"
    bitcoin-cli importprivkey $wif "autogen_${name}" false

    # Derived Public Key
    derivedPubKey="$(bx hd-to-public ${derivedPrivKey})"
    echo "$name derivedPubKey $value: $derivedPubKey"

    # Public Key (Hex)
    ECPubKey="$(bx hd-to-ec ${derivedPubKey})"
    echo "$name public key $value: $ECPubKey"

    # Address
    address="$(bx ec-to-address ${ECPubKey})"
    echo "$name address $value: $address"

    # No comma for the last derivation
    if (( $value == 3))
    then
      walletsJSON+='''{"wif": "'$wif'", "pubKey": "'$ECPubKey'", "address": "'$address'"}'''
    else
      walletsJSON+='''{"wif": "'$wif'", "pubKey": "'$ECPubKey'", "address": "'$address'"},'''
    fi

    echo
  done

  # Last wallet should be alice..
  if [[ "$name" == "alice" ]]
  then
    walletsJSON+="]}"
  else
    walletsJSON+="],"
  fi

done

echo "$walletsJSON" | jq . > wallets.json