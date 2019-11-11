# Legacy P2PKH

P2PKH is the standard and most common output type until now, used before the Segregated Witness soft fork, that Pays To PubKey Hash \(P2PKH\). A P2PKH contains instructions which allow anyone to spend that output if they can prove they control the private key corresponding to the hashed public key. These instructions are called the pubkey script or scriptPubKey.

A standard unlocking script in the input of the spending transaction looks like so `<Sig> <PubKey>`. It spends a standard P2PKH locking script \(scriptPubKey\) that looks like so `OP_DUP OP_HASH160 <PubkeyHash> OP_EQUALVERIFY OP_CHECKSIG`.

A P2PKH Bitcoin payment address is a Base58 representation of a hashed public key.

## What's Next?

Continue "Part Two: Pay To Public Key Hash" with [Simple Transaction \(1 input, 1 output\) - Legacy P2PKH](p2pkh_simple_tx_1_1.md).
