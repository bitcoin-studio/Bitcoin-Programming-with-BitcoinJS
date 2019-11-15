# Generating and Importing Wallets

In order to follow this Bitcoin programming tutorial with ease, it would be great to always use the same set of addresses, in NodeJS as well as in Bitcoin Core CLI. But we currently can't simply import a mnemonic or a HD wallet seed into Bitcoin Core.

So we will use the [**Bitcoin Test Wallets Generator**](https://github.com/bitcoin-studio/Bitcoin-Test-Wallets-Generator) library made by Bitcoin Studio. It allows us to generate six different BIP32 HD wallets \(Alice, Bob, Carol, Dave, Eve and Mallory\), each containing three distinct ECDSA key pairs. From each public key is derived three Bitcoin addresses for each type of PKH output. The library writes all the keys and addresses in a new `wallets.json` file. Then the script import all the private keys into Bitcoin Core \(make sure the software is launched\).

Each bitcoin address is marked by a label such as _alice\_1_, which you can list with the `listlabels` Bitcoin Core command. If this command returns an empty array it means that the wallets have not been imported properly.

> Windows users will have issues if the library is not able to execute bash scripts.

## Instructions

After launching Bitcoin Core in regtest mode, run the following commands.  
It will generate for you six test wallets, create a `wallets.json` file and import all private keys into Bitcoin Core.

```bash
cd code
npm install
npx bitcointestwallets
```

By default the test wallets used in this guide are the same as the default ones in the [**Bitcoin Test Wallets Generator**](https://github.com/bitcoin-studio/Bitcoin-Test-Wallets-Generator) library. Check the library's repository if you want to use different wallets.

## What's Next?

Continue "Part One: Preparing The Work Environment" with [Generating Blocks](generating_blocks.md).

