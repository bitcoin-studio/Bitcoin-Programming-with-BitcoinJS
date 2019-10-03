# 1.0: Introduction to Bitcoin Programming with BitcoinJS and Bitcoin Core

## How to Start

Throughout this guide we will use the famous [BitcoinJS](https://github.com/bitcoinjs/bitcoinjs-lib) open source library, 
started in 2011 and mainly written and maintained by Daniel Cousens, as well as most of its dependencies.
Additional purpose-specific libraries are sometimes required. You can find all you need on the 
[BitcoinJS Organization Repositories](https://github.com/bitcoinjs).

We will also use the Bitcoin Core command-line interface in Regtest mode for various common tasks (decoding raw transaction, 
sending raw transaction, getting address information, decoding Bitcoin script, funding addresses, ...).
You can download the software at [bitcoin.org - Bitcoin Core Download Page](https://bitcoin.org/en/download) or at 
[bitcoincore.org - Bitcoin Core Download Page](https://bitcoincore.org/en/download/).

You are able to use the integrated console of Bitcoin Core GUI (_Help > Debug window > Console_). The GUI also gives you 
the ability to check your wallet and transaction details. 
Otherwise you can type the commands into `bitcoin-cli` which connects to the `bitcoind` daemon.
Check the documentation of the two websites cited above if you need more help.

> Bitcoin Core software is not the only implementation of the Bitcoin protocol and other implementations should work.
> However Bitcoin Core is by far the most used and most robust implementation.
> Also, beware of Bitcoin scam forks. Many websites like bitcoin.com are promoting other coins pretending to be a Bitcoin upgrade.
> Download only trusted Bitcoin software after rigorous due diligence.

You need to make sure that your bitcoin configuration file is set to run Bitcoin Core in Regtest mode. You can replace 
your default configuration with the one in **_[code/bitcoin.conf](code/bitcoin.conf)_**. Make sure it suits your needs 
before running the software.

Install the javascript libraries. 
> Be careful, the NPM version of BitcoinJS is not necessarily up to date the github master branch.
> This is why the package.json references a github commit.
```
$ cd code
$ npm install
```


### Complementary libraries and scripts

Complementary library `bx` aka [Libbitcoin Explorer](https://github.com/libbitcoin/libbitcoin-explorer) is useful for some
quick tasks like generating seed entropy or computing a hash.
For address derivation tasks or others, make sure to configure the bx.cfg configuration file appropriately.

You will find a number of handy scripts in the `./code` directory. 
It will be much easier to follow along this guide if you always use the same addresses, in NodeJS and in Bitcoin Core. 
The `generate_wallets.js` script will help you with wallet generation and private key importation. Check out 
**_[2.0: Generating and Importing Wallets](02_0_Generating_and_Importing_Wallets.md)_** for more information.

You can find a simple handy base converter in `baseConverter.js` 

Finally, numbers in Bitcoin script require to be encoded in little endian hexadecimal. BitcoinJS takes care of that but 
in case you need it check out the `int2lehex.sh` bash script. Don't forget to `$ chmod 755 integer2lehex.sh`.


## Transaction Basics

In order to follow along this guide, you need to understand some basics about Bitcoin transaction.
So let's quickly describe them before starting.

There are two categories of transactions, respectively Pay To PubKey Hash and Pay To Script Hash. 
We will illustrate the first category in part two of this guide, and the second on part three.

A Bitcoin transaction is composed of one or more inputs, each of them consuming the value of a corresponding previous 
unspent transaction outputs, and creates one or more unspent transaction outputs.

An unspent transaction output is commonly abbreviated in **UTXO**. 
So in order to spend a UTXO, we have to create an input that will reference it and provide some kind of unlocking script.

The unlocking script is created in accordance with the rules specified in the UTXO locking script.

The Bitcoin system is charged with making sure the signatures are correct, that the UTXOs exist and are spendable, 
and that the sum of the output values is less than or equal to the sum of the input values.
Any excess value becomes fees paid to miners for including the transaction.


### Legacy, Embedded Backward-compatible Segwit and Native Segwit outputs

The two categories described above, Pay To PubKey Hash and Pay To Script Hash, are actually available in three different
flavours: legacy, embedded Segwit and native Segwit.

Legacy is the output type before the Segregated Witness soft fork, activated on August 23, 2017. It comprise P2PKH and P2SH.

Native Segwit outputs comprise P2WPKH and P2WSH.

Embedded Segwit has been developed to ensure a smooth transition to Segwit. The idea is to embed P2WPKH or P2WSH into a 
regular P2SH. The two resulting types are abbreviated in P2SH-P2WPKH and P2SH-P2WSH. 


## What's Next?

Continue "PART ONE: PREPARING THE WORK ENVIRONMENT" with [2.0: Generating and Importing Wallets](02_0_Generating_and_Importing_Wallets.md).
