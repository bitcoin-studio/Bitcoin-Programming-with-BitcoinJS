# 2.1: Generating Blocks

The Regtest mode replicates the 100-block maturation time rule, forcing us to wait 101 confirmations to spend a 
coinbase transaction. So, in order to have funds in Bitcoin Core wallet and being able to spend it we need to generate 101 blocks.
Since Bitcoin Core v0.18 we have to use the command `generatetoaddress`, specifying the miner's address that will receive the 
block rewards. 
> Here we use the native segwit address of Dave's first account. 
> See  **_[wallets.json](code/wallets.json)_** 
```
$ generatetoaddress 101 bcrt1qnqud2pjfpkqrnfzxy4kp5g98r8v886wgvs9e7r
```

We can then list all the generated UTXOs using an output descriptor. 
```
$ scantxoutset start '["addr(bcrt1qnqud2pjfpkqrnfzxy4kp5g98r8v886wgvs9e7r)"]' 
```
We can't use `listunspent` here because immature UTXOs aren't returned.


## What's Next?

Advance through "PART TWO: PAY TO PUBLIC KEY HASH" with [3.0: Legacy P2PKH](03_0_P2PKH.md).
