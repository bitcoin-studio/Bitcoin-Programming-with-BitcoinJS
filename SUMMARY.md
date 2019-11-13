# Table of contents

* [Bitcoin Programming with BitcoinJS, Bitcoin Core and LND](README.md)

## Part One: Preparing The Work Environment

* [Introduction to Bitcoin Programming](part-one-preparing-the-work-environment/introduction_bitcoin_programming.md)
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
* [Spend a Nested Segwit P2SH-P2WPKH UTXO](part-two-pay-to-public-key-hash/p2sh_p2wpkh/README.md)
  * [Spend a Nested Segwit P2SH-P2WPKH UTXO](part-two-pay-to-public-key-hash/p2sh_p2wpkh/p2sh_p2wpkh_spend_1_1.md)

## Part Three: Pay To Script Hash

* [Puzzles](part-three-pay-to-script-hash/puzzles/README.md)
  * [Algebra Puzzle - Legacy P2SH](part-three-pay-to-script-hash/puzzles/algebra_puzzle_p2sh.md)
  * [Algebra Puzzle - Native Segwit P2WSH](part-three-pay-to-script-hash/puzzles/algebra_puzzle_p2wsh.md)
  * [Algebra Puzzle - Nested Segwit P2SH-P2WSH](part-three-pay-to-script-hash/puzzles/algebra_puzzle_np2wsh.md)
  * [Computational Puzzle: SHA-1 Collision](part-three-pay-to-script-hash/puzzles/computational_puzzle_sha1_collision_p2sh.md)
* [Multi-signatures](part-three-pay-to-script-hash/multi_signatures/README.md)
  * [Multi-signature Legacy 2 of 4](part-three-pay-to-script-hash/multi_signatures/multisig_p2sh_2_4.md)
  * [Multi-signature Native Segwit 2 of 4](part-three-pay-to-script-hash/multi_signatures/multisig_p2wsh_p2ms_2_4.md)
  * [Multi-signature Nested Segwit 2 of 4](part-three-pay-to-script-hash/multi_signatures/multi-signature-nested-segwit-2-of-4.md)
* [Timelocks](part-three-pay-to-script-hash/timelocks/README.md)
  * [Script with CHECKLOCKTIMEVERIFY - Legacy P2SH](part-three-pay-to-script-hash/timelocks/cltv_p2sh.md)
  * [Script with CHECKLOCKTIMEVERIFY - Native Segwit P2WSH](part-three-pay-to-script-hash/timelocks/cltv_p2wsh.md)
  * [Script with CHECKSEQUENCEVERIFY - Legacy P2SH](part-three-pay-to-script-hash/timelocks/csv_p2sh.md)
  * [Script with CHECKSEQUENCEVERIFY - Native Segwit P2WSH](part-three-pay-to-script-hash/timelocks/csv_p2wsh.md)
* [Submarine Swaps](part-three-pay-to-script-hash/submarine_swaps/README.md)
  * [Submarine Swap - On-chain to Off-chain](part-three-pay-to-script-hash/submarine_swaps/swap_on2off_p2wsh.md)
  * [Reverse Submarine Swap - Off-chain to On-chain](part-three-pay-to-script-hash/submarine_swaps/swap_off2on_p2wsh.md)

## Part Four: Data Embedding

* [Data Embedding with OP\_RETURN](part-four-data-embedding/data_embedding_op_return.md)

## Tools

* [Base58Check encoding and decoding of P2PKH address](tools/base58check_address_encoding.md)
* [Data Length and Base Conversion](tools/data_length_base_conversion.md)

