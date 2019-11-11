# Generating and Importing Wallets

In order to follow this Bitcoin programming tutorial with ease, it would be great to always use the same set of addresses, in NodeJS as well as in Bitcoin Core CLI.

We currently can't import a mnemonic or a HD wallet seed to Bitcoin Core. So we will use the script 
[_**generate\_wallets.js**_](https://github.com/bitcoin-studio/Bitcoin-Programming-with-BitcoinJS/blob/master/code/generate_wallets.js)
which will generate six different BIP32 HD wallets \(Alice, Bob, Carol, Dave, Eve and Mallory\), each containing three 
distinct ECDSA key pairs. From each public key is derived three Bitcoin addresses for each type of PKH output. 
The script writes all the keys and addresses in `wallets.json` file. Then the script import all the private keys into 
Bitcoin Core \(make sure the software is launched\) by calling the 
[***import\_privkeys.sh***](https://github.com/bitcoin-studio/Bitcoin-Programming-with-BitcoinJS/blob/master/code/import_privkeys.sh)
Bash script internally.

> If you are on a Windows system you can use a Bash interpreter like Cygwin or Windows Subsystem for Linux \(WSL\) on Windows 10.

Each bitcoin address is marked by a label such as *alice\_1*, which you can list with the `listlabels` command.
In order to create a HD wallet we start from a 128 bits entropy value. If you want to use the same addresses as the ones 
used throughout this guide you can just keep the current entropy values written in 
[_**generate\_wallets.js**_](https://github.com/bitcoin-studio/Bitcoin-Programming-with-BitcoinJS/blob/master/code/generate_wallets.js). 
Otherwise, you can use the Bitcoin command line tool [Libbitcoin explorer](https://github.com/libbitcoin/libbitcoin-explorer) to generate new entropy values and replace the existing ones.

```shell
$ bx seed -b 128
```

## Instructions

Generate six wallets, create a `wallets.json` file and import all private keys to Bitcoin Core.

> Don't forget to have Bitcoin Core running.
>
> ```shell
> $ cd code
> $ npm install
> $ node generate_wallets.js
> ```
>
> `generate_wallets.sh` is simply in this repository for demonstration purpose. It uses `bx` for the key derivation, but we can't use it because current `bx` v3 doesn't support Segwit.

## What's Next?

Continue "Part One: Preparing The Work Environment" with [Generating Blocks](02_1_generating_blocks.md).