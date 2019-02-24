# 10.1: Base58Check encoding and decoding of P2PKH address

A P2PKH address is a public key hash encoded in Base58Check.
Starting from a public key hash, we add a version byte at the beginning and a checksum at the end, then we encode this in Base58. 
To have a better understanding of this encoding have a look at **_[addressEncoding.js](code/addressEncoding.js)_**.

A Bitcoin user usually send money to an address, but in fact the corresponding public key hash is stored into the blockchain.


## Encode a public key hash to a P2PKH address
```
$ cd code 
$ npm run Base58CheckEncodeP2PKH fb8820f35effa054399540b8ca86040d8ddaa4d5
```

## Decode a P2PKH address to a public key hash
```
$ cd code 
$ npm run Base58CheckDecodeP2PKH n4SvybJicv79X1Uc4o3fYXWGwXadA53FSq
```