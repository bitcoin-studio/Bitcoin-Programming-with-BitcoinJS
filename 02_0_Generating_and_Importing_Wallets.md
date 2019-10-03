# 2.0: Generating and Importing Wallets

In order to follow this Bitcoin programming tutorial with ease, it would be great to always use the same set of addresses, in NodeJS as well as in 
Bitcoin Core CLI.

We currently can't import a mnemonic or a HD wallet seed to Bitcoin Core. So we will use the script 
**_[generate_wallets.js](code/generate_wallets.js)_** which will generate six different BIP32 HD wallets (Alice, Bob, 
Carol, Dave, Eve and Mallory), each containing three distinct ECDSA key pairs. From each public key is derived three 
Bitcoin addresses for each type of PKH output.
The script writes all the keys and addresses in `wallets.json` file.
Then the script import all the private keys into Bitcoin Core (make sure the software is launched) by calling the 
**_[import_privkeys.sh](code/import_privkeys.sh)_** Bash script internally. 
> If you are on a Windows system you can use a Bash interpreter like Cygwin or Windows Subsystem for Linux (WSL) on Windows 10.

Each bitcoin address is marked by a label `autogen_[wallet_name]`, which you can list with the `listlabels` command.

In order to create a HD wallet we start from a 128 bits entropy value.
If you want to use the same addresses as the ones used throughout this guide you can just keep the current entropy values 
written in **_[generate_wallets.js](code/generate_wallets.js)_**.
Otherwise, you can use the Bitcoin command line tool 
[Libbitcoin explorer](https://github.com/libbitcoin/libbitcoin-explorer) to generate new entropy values and replace the 
existing ones.
```
$ bx seed -b 128
```


## Instructions

Generate six wallets, create a `wallets.json` file and import all private keys to Bitcoin Core.
> Don't forget to have Bitcoin Core running.
```
$ cd code
$ npm install
$ node generate_wallets.js
```

> `generate_wallets.sh` is simply in this repository for demonstration purpose. It uses `bx` for the key derivation, but
> we can't use it because current `bx` v3 doesn't support Segwit. 


## What's Next?

Continue "PART ONE: PREPARING THE WORK ENVIRONMENT" with [2.1: Generating Blocks](02_1_Generating_Blocks.md).