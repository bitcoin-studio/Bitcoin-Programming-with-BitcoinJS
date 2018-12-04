# 4.0: Native Segwit P2WPKH 

> Read more about P2WPKH in [BIP141](https://github.com/bitcoin/bips/blob/master/bip-0141.mediawiki#p2wpkh)


P2WPKH is the native Segwit version of a Pay to Public Key hash.

The scripts and script data are spread out as follows
```
witness:      <signature> <pubkey>
scriptSig:    (empty)
scriptPubKey: 0 <20-byte-key-hash>
```

Each Bitcoin full node will parse the `scriptPubKey` and check the witness program size. 
If it is 20 bytes long, it is interpreted as a P2WPKH program.

Then each validating node
* checks that Witness is `<sig> <pubKey>`
* HASH160 of the public key match the 20-byte witness program
* verify the signature against the public key with CHECKSIG operation

Comparing with a traditional P2PKH output, the P2WPKH equivalent occupies 3 less bytes in the scriptPubKey, and moves 
the signature and public key from scriptSig to witness.


## What's Next?

Continue "PART TWO: PAY TO PUBLIC KEY HASH" with [4.1: Spend a Native Segwit P2WPKH UTXO](04_1_P2WPKH_Spend_1_1.md).
