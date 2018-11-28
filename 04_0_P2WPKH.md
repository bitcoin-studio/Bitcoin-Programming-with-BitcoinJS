# 4.0: Native Segwit P2WPKH 

P2WPKH is the native Segwit version of a Pay to Public Key hash.

The scripts are composed as follow
`<empty unlocking script>` + `<locking script (0 version byte + 20-bytes witness program)>`.<br/> 
Then `<witness stack (<sig> <pubKey>)>` is executed.


Each Bitcoin full node will parse the script and check the witness program size. 
If it is 20 bytes long 
* Interpreted as a P2WPKH program
* Witness must be `<sig> <pubKey>`
* HASH160 of the public key must match the 20-byte witness program
* The signature is verified against the public key with CHECKSIG operation
