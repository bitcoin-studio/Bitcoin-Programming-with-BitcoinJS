# Generating Blocks

The regtest mode replicates the 100-block maturation time rule, forcing us to wait 101 confirmations to spend a coinbase transaction. So, in order to have funds in Bitcoin Core wallet and being able to spend it we need to generate 101 blocks. Since Bitcoin Core v0.18 we have to use the command `generatetoaddress`, specifying the miner's address that will receive the block rewards.

> Here we use the native segwit address of Dave's first account, see [_**wallets.json**_](https://github.com/bitcoin-studio/Bitcoin-Programming-with-BitcoinJS/blob/master/code/wallets.json).  
> But we can use any address.  
> We can generate a new address with `getnewaddress`.  

```bash
generatetoaddress 101 bcrt1qnqud2pjfpkqrnfzxy4kp5g98r8v886wgvs9e7r
```

We can then list all the generated UTXOs using an output descriptor.

```bash
scantxoutset start '["addr(bcrt1qnqud2pjfpkqrnfzxy4kp5g98r8v886wgvs9e7r)"]'
```

We can't use `listunspent` here because immature UTXOs aren't returned.

## What's Next?

Advance through "Part Two: Pay To Public Key Hash" with [Legacy P2PKH](../part-two-pay-to-public-key-hash/p2pkh/).

