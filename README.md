# Programming Bitcoin with BitcoinJS and Bitcoin Core CLI

Welcome to the extensive guide to Bitcoin Javascript!
In this guide we will explain how to create various types of Bitcoin transactions, using the 
[BitcoinJS](https://github.com/bitcoinjs/bitcoinjs-lib) library. 

We will use the Bitcoin Core command-line interface in Regtest mode for various common tasks, as well as some 
complementary libraries like `bx` aka [Libbitcoin Explorer](https://github.com/libbitcoin/libbitcoin-explorer).

Throughout this guide, we want to provide you with sufficient explanation to each command to understand it without drowning 
in information. You can refer to additional resources to better understand the Bitcoin protocol. 
For example, check out our [Bitcoin Studio presentations](https://www.bitcoin-studio.com/resources).

At the moment, Bitcoin Javascript tutorials are still very scarce, but we believe it doesn't have to be this way. 
The following guide intends to address this problem. 


## Requirements

Having prior theoretical knowledge of the Bitcoin protocol will surely help, but we provide comprehensive explanation 
throughout this guide so it fits for beginners.  

Technical requirements
* Node v10 recommended
* BitcoinJS v4
* Bitcoin Core v18
* Bash or a Bash interpreter like Cygwin or Windows Subsystem for Linux (WSL)
* Libbitcoin Explorer v3 (optional)


## Copyright

Unless otherwise noted, the contents of this repository are Copyright ©2019 by [Bitcoin Studio](https://www.bitcoin-studio.com) 
and are licensed [GPL v3](./LICENSE).


## Disclaimer

* This guide is not an official documentation
* You must check the BitcoinJS repository for up-to-date code
* Non-standard scripts are exposed for educational purposes
* The author of this guide is not responsible for any loss of funds 


## Table of Contents

**PART ONE: PREPARING THE WORK ENVIRONMENT**

* [1.0: Introduction to Bitcoin Programming with BitcoinJS and Bitcoin Core](01_0_Introduction_Bitcoin_Programming.md)
* [2.0: Generating and Importing Wallets](02_0_Generating_and_Importing_Wallets.md)
* [2.1: Generating Blocks](02_1_Generating_Blocks.md)


**PART TWO: PAY TO PUBLIC KEY HASH**

* [3.0: Legacy P2PKH](03_0_P2PKH.md)
  * [3.1: Simple Transaction (1 input, 1 output) - Legacy P2PKH](03_1_P2PKH_Simple_Tx_1_1.md)
  * [3.2: Typical Transaction (1 input, 2 outputs) - Legacy P2PKH](03_2_P2PKH_Typical_Tx_1_2.md)
  * [3.3: UTXO Consolidation (3 inputs, 1 output) - Legacy P2PKH](03_3_P2PKH_UTXO_Consolidation_3_1.md)   
  * [3.4: Batching Transaction (1 input, 5 outputs) - Legacy P2PKH](03_4_P2PKH_Batching_Tx_1_5.md)   
  * [3.5: Coinjoin Transaction (4 inputs, 4 outputs) - Legacy P2PKH](03_5_P2PKH_Coinjoin_Tx_4_4.md)
* [4.0: Native Segwit P2WPKH](04_0_P2WPKH.md)
  * [4.1: Spend a Native Segwit P2WPKH UTXO](04_1_P2WPKH_Spend_1_1.md)
  * [4.2: Typical Transaction (1 input, 2 outputs) - Native Segwit P2WPKH](04_2_P2WPKH_Typical_Tx_1_2.md)
* [5.0: Spend a Embedded Segwit P2SH-P2WPKH UTXO](05_0_P2SH_P2WPKH_Spend_1_1.md)
* [6.0: Embedding Data With OP_RETURN](06_0_Embedding_Data_OP_RETURN.md)


**PART THREE: PAY TO SCRIPT HASH**

* [7.0: Bitcoin Script Puzzles or Pay to Script Hash](07_0_Bitcoin_Script_Puzzles.md)
  * [7.1: Algebra Puzzle - Legacy P2SH](07_1_P2SH_Algebra_Puzzle.md)
  * [7.2: Algebra Puzzle - Native Segwit P2WSH](07_2_P2WSH_Algebra_Puzzle.md)
  * [7.3: Algebra Puzzle - Embedded Segwit P2SH-P2WSH](07_3_P2SH_P2WSH_Algebra_Puzzle.md)
  * [7.4: Computational Puzzle: SHA-1 Collision - Legacy P2SH](07_4_P2SH_Computational_Puzzle_SHA-1_Collision.md)
* [8.0: Multi-signature Transactions](08_0_Multisig_Transactions.md)
  * [8.1: Multi-signature Legacy 2 of 4](08_1_Multisig_P2SH_2_4.md)
  * [8.2: Multi-signature Native Segwit 2 of 4](08_2_Multisig_P2WSH_P2MS_2_4.md)
  * [8.3: Multi-signature Embedded Segwit 2 of 4](08_3_Multisig_P2SH_P2WSH_P2MS_2_4.md)
* [9.0: Timelock Transactions](09_0_Timelock_Transactions.md)
  * [9.1: Script with CHECKLOCKTIMEVERIFY - Legacy P2SH](09_1_P2SH_CLTV.md)
  * [9.2: Script with CHECKLOCKTIMEVERIFY - Native Segwit P2WSH](09_2_P2WSH_CLTV.md)
  * [9.3: Script with CHECKSEQUENCEVERIFY - Legacy P2SH](09_3_P2SH_CSV.md)
  * [9.4: Script with CHECKSEQUENCEVERIFY - Native Segwit P2WSH](09_4_P2WSH_CSV.md)
  
  
**MISCELLANEOUS**  

* [10.1: Base58Check Encoding and Decoding of P2PKH Address](10_1_Base58Check_Address_Encoding.md)
* [10.2: Data Length and Base Conversion](10_2_Data_Length_Base_Conversion.md)

<br/>

Please consider making a donation so that I can continue producing free educational content <br/>
[Donate with Bitcoin | 3CmJsUcx6txveq32kVqG92pczc1suLh6BD](bitcoin_donation.png)
