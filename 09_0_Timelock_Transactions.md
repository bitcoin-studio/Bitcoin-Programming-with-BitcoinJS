# 9.0: Timelock Transactions

## Absolute Timelock

### nLockTime

Part of the original Bitcoin implementation, nLockTime is a field that specifies the earliest time a transaction may 
be added to a valid block. A later Bitcoin soft fork allowed nLockTime to alternatively specify the 
lowest block height a transaction may be added to a valid block.

Although every transaction contains the nLockTime field, every wallet up until recently set nLockTime to 0, meaning the 
transaction was valid in any block. Starting with Bitcoin Core 0.11.0, every normal transaction automatically generated 
by began including an nLockTime set to a recent block height as a way to make hypothesized fee sniping less profitable; 
other wallets are recommended to do the same.

### OP_CHECKLOCKTIMEVERIFY

In late 2015, the BIP65 soft fork redefined the NOP2 opcode as the CheckLockTimeVerify (CLTV) opcode, allowing transaction 
outputs (rather than whole transactions) to be encumbered by a timelock. When the CLTV opcode is called, it will cause 
the script to fail unless the nLockTime on the transaction is equal to or greater than the time parameter provided to the 
CLTV opcode. Since a transaction may only be included in a valid block if its nLockTime is in the past, this ensures the 
CLTV-based timelock has expired before the transaction may be included in a valid block.

CLTV is currently used in CLTV-style payment channels.


## Relative Timelock

### nSequence

In mid-2016, the BIP68/112/113 soft fork gave consensus-enforced meaning to some values in the nSequence field that is 
a part of every transaction input, creating a "relative locktime". This allowed an input to specify the 
earliest time it can be added to a block based on how long ago the output being spent by that input was included in a 
block on the block chain.

### OP_CHECKSEQUENCEVERIFY

Also part of the BIP68/112/113 soft fork was the CheckSequenceVerify opcode, which provides for relative locktime the same 
feature CLTV provides for absolute locktime. When the CSV opcode is called, it will cause the script to fail unless the 
nSequence on the transaction indicates an equal or greater amount of relative locktime has passed than the parameter 
provided to the CSV opcode. Since an input may only be included in a valid block if its relative locktime is expired, 
this ensures the CSV-based timelock has expired before the transaction may be included in a valid block.

CSV is used by Lightning Network transactions.


## What's Next?

Continue "PART THREE: PAY TO SCRIPT HASH" with [9.1: Script with CHECKLOCKTIMEVERIFY - Legacy P2SH](09_1_P2SH_CLTV.md).
