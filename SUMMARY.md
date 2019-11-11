# Table of contents

* [Programming Bitcoin with BitcoinJS and Bitcoin Core CLI](README.md)

## Part One: Preparing The Work Environment

* [Introduction to Bitcoin Programming with BitcoinJS and Bitcoin Core](part-one-preparing-the-work-environment/introduction_bitcoin_programming.md)
* [Generating and Importing Wallets](part-one-preparing-the-work-environment/generating_and_importing_wallets.md)
* [Generating Blocks](part-one-preparing-the-work-environment/generating_blocks.md)

## Part Two: Pay To Public Key Hash

* [Legacy P2PKH](part-two-pay-to-public-key-hash/p2pkh/README.md)
  * [Simple Transaction \(1 input, 1 output\) - Legacy P2PKH](part-two-pay-to-public-key-hash/p2pkh/p2pkh_simple_tx_1_1.md)
  * [Typical Transaction \(1 input, 2 outputs\) - Legacy P2PKH](part-two-pay-to-public-key-hash/p2pkh/p2pkh_typical_tx_1_2.md)
  * [UTXO Consolidation \(3 inputs, 1 output\) - Legacy P2PKH](part-two-pay-to-public-key-hash/p2pkh/p2pkh_utxo_consolidation_3_1.md)
  * [Batching Transaction \(1 input, 5 outputs\) - Legacy P2PKH](part-two-pay-to-public-key-hash/p2pkh/p2pkh_batching_tx_1_5.md)
  * [Coinjoin Transaction \(4 inputs, 4 outputs\) - Legacy P2PKH](part-two-pay-to-public-key-hash/p2pkh/p2pkh_coinjoin_tx_4_4.md)
* [Native Segwit P2WPKH](part-two-pay-to-public-key-hash/p2wpkh/README.md)
  * [Spend a Native Segwit P2WPKH UTXO](part-two-pay-to-public-key-hash/p2wpkh/p2wpkh_spend_1_1.md)
  * [Typical Transaction \(1 input, 2 outputs\) - Native Segwit P2WPKH](part-two-pay-to-public-key-hash/p2wpkh/p2wpkh_typical_tx_1_2.md)
* [Spend a Embedded Segwit P2SH-P2WPKH UTXO](part-two-pay-to-public-key-hash/p2sh_p2wpkh/README.md)
  * [Spend a Embedded Segwit P2SH-P2WPKH UTXO](part-two-pay-to-public-key-hash/p2sh_p2wpkh/p2sh_p2wpkh_spend_1_1.md)

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

* [10.1: Embedding Data with OP\_RETURN](miscellaneous/10_1_embedding_data_op_return.md)
* [11.1: Base58Check encoding and decoding of P2PKH address](miscellaneous/11_1_base58check_address_encoding.md)
* [11.2: Data Length and Base Conversion](miscellaneous/11_2_data_length_base_conversion.md)

