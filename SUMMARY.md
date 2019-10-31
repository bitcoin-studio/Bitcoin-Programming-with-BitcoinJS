# Table of contents

* [Programming Bitcoin with BitcoinJS and Bitcoin Core CLI](README.md)


## Part One: Preparing The Work Environment

* [1.0: Introduction to Bitcoin Programming with BitcoinJS and Bitcoin Core](part-one-preparing-the-work-environment/01_0_introduction_bitcoin_programming.md)
* [2.0: Generating and Importing Wallets](part-one-preparing-the-work-environment/02_0_generating_and_importing_wallets.md)
* [2.1: Generating Blocks](part-one-preparing-the-work-environment/02_1_generating_blocks.md)


## Part Two: Pay To Public Key Hash

* [3.0: Legacy P2PKH](part-two-pay-to-public-key-hash/03_0_p2pkh/README.md)
  * [3.1: Simple Transaction \(1 input, 1 output\) - Legacy P2PKH](part-two-pay-to-public-key-hash/03_0_p2pkh/03_1_p2pkh_simple_tx_1_1.md)
  * [3.2: Typical Transaction \(1 input, 2 outputs\) - Legacy P2PKH](part-two-pay-to-public-key-hash/03_0_p2pkh/03_2_p2pkh_typical_tx_1_2.md)
  * [3.3: UTXO Consolidation \(3 inputs, 1 output\) - Legacy P2PKH](part-two-pay-to-public-key-hash/03_0_p2pkh/03_3_p2pkh_utxo_consolidation_3_1.md)
  * [3.4: Batching Transaction \(1 input, 5 outputs\) - Legacy P2PKH](part-two-pay-to-public-key-hash/03_0_p2pkh/03_4_p2pkh_batching_tx_1_5.md)
  * [3.5: Coinjoin Transaction \(4 inputs, 4 outputs\) - Legacy P2PKH](part-two-pay-to-public-key-hash/03_0_p2pkh/03_5_p2pkh_coinjoin_tx_4_4.md)
* [4.0: Native Segwit P2WPKH](part-two-pay-to-public-key-hash/04_0_p2wpkh/README.md)
  * [4.1: Spend a Native Segwit P2WPKH UTXO](part-two-pay-to-public-key-hash/04_0_p2wpkh/04_1_p2wpkh_spend_1_1.md)
  * [4.2: Typical Transaction \(1 input, 2 outputs\) - Native Segwit P2WPKH](part-two-pay-to-public-key-hash/04_0_p2wpkh/04_2_p2wpkh_typical_tx_1_2.md)
* [5.0: Spend a Embedded Segwit P2SH-P2WPKH UTXO](part-two-pay-to-public-key-hash/05_0_p2sh_p2wpkh_spend_1_1.md)
* [6.0: Embedding Data with OP\_RETURN](part-two-pay-to-public-key-hash/06_0_embedding_data_op_return.md)


## Part Three: Pay To Script Hash

* [7.0: Puzzles](part-three-pay-to-script-hash/07_0_bitcoin_script_puzzles/README.md)
  * [7.1: Algebra Puzzle - Legacy P2SH](part-three-pay-to-script-hash/07_0_bitcoin_script_puzzles/07_1_p2sh_algebra_puzzle.md)
  * [7.2: Algebra Puzzle - Native Segwit P2WSH](part-three-pay-to-script-hash/07_0_bitcoin_script_puzzles/07_2_p2wsh_algebra_puzzle.md)
  * [7.3: Algebra Puzzle - Embedded Segwit P2SH-P2WSH](part-three-pay-to-script-hash/07_0_bitcoin_script_puzzles/07_3_p2sh_p2wsh_algebra_puzzle.md)
  * [7.4: Computational Puzzle: SHA-1 Collision](part-three-pay-to-script-hash/07_0_bitcoin_script_puzzles/07_4_p2sh_computational_puzzle_sha-1_collision.md)
* [8.0: Multi-signature Transactions](part-three-pay-to-script-hash/08_0_multisig_transactions/README.md)
  * [8.1: Multi-signature Legacy 2 of 4](part-three-pay-to-script-hash/08_0_multisig_transactions/08_1_multisig_p2sh_2_4.md)
  * [8.2: Multi-signature Native Segwit 2 of 4](part-three-pay-to-script-hash/08_0_multisig_transactions/08_2_multisig_p2wsh_p2ms_2_4.md)
  * [8.3: Multi-signature Embedded Segwit 2 of 4](part-three-pay-to-script-hash/08_0_multisig_transactions/08_3_multisig_p2sh_p2wsh_p2ms_2_4.md)
* [9.0: Timelock Transactions](part-three-pay-to-script-hash/09_0_timelock_transactions/README.md)
  * [9.1: Script with CHECKLOCKTIMEVERIFY - Legacy P2SH](part-three-pay-to-script-hash/09_0_timelock_transactions/09_1_p2sh_cltv.md)
  * [9.2: Script with CHECKLOCKTIMEVERIFY - Native Segwit P2WSH](part-three-pay-to-script-hash/09_0_timelock_transactions/09_2_p2wsh_cltv.md)
  * [9.3: Script with CHECKSEQUENCEVERIFY - Legacy P2SH](part-three-pay-to-script-hash/09_0_timelock_transactions/09_3_p2sh_csv.md)
  * [9.4: Script with CHECKSEQUENCEVERIFY - Native Segwit P2WSH](part-three-pay-to-script-hash/09_0_timelock_transactions/09_4_p2wsh_csv.md)

  
## Miscellaneous

* [10.1: Base58Check encoding and decoding of P2PKH address](miscellaneous/10_1_base58check_address_encoding.md)
* [10.2: Data Length and Base Conversion](miscellaneous/10_2_data_length_base_conversion.md)