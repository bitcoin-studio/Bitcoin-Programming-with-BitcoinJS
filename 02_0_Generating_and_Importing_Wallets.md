# 2.0: Generating and Importing Wallets

In order to ease Bitcoin Programming, it would be great to always use the same set of addresses, in NodeJS as well as in 
Bitcoin Core CLI.

For that purpose we will use the script **_[generate_wallets.js](code/generate_wallets.js)_** which will generate six different
BIP32 HD wallets (Alice, Bob, Carol, Dave, Eve and Mallory) with three distinct key pairs and derive the all three 
different types of addresses for each of them.

Then we import all the private keys into Bitcoin Core using the **_[import_privkeys.sh](code/import_privkeys.sh)_** Bash 
script.
Each address is marked by a label `autogen_[wallet_name]`, which you can list with the `listlabels` command.   
Note that we currently can't import a mnemonic or a seed to Bitcoin Core.

We start the derivation process for each wallet from a 128 bits entropy. 
Keep the current entropy values in order to have the same addresses as used throughout this guide.
Otherwise, you can use the Bitcoin command line tool 
[Libbitcoin explorer](https://github.com/libbitcoin/libbitcoin-explorer) to generate new ones, doing `bx seed -b 128`.

Generate six wallets, create a `wallets.json` file and import all private keys to Bitcoin Core.
> Don't forget to have Bitcoin Core running.
`$ node generate_wallets.js`

> `generate_wallets.sh` is simply in this repository for demonstration purpose. It uses `bx` for the key derivation, but
> we can't use it because current `bx` v3 doesn't support Segwit. 


## What's Next?

Advance through "PART TWO: PAY TO PUBLIC KEY HASH" with [3.0: Legacy P2PKH](03_0_P2PKH.md).
