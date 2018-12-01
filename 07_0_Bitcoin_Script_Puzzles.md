# 7.0: Bitcoin Script Puzzles or Pay to Script Hash

Bitcoin scripts can be puzzles of any sort and they don't actually have to depend on the knowledge of a secret key.
Complex scripts are replaced by shorter fingerprints in the transaction output, which allows for smaller transaction and
less fees.
Scripts can be hashed and encoded as a bitcoin address, hence the term Pay to Script Hash, and sending money to it is the 
same as sending to a public key hash address.

P2SH shifts the transaction fee cost of a long script from the sender to the recipient, who has to include a large redeem 
script in the input to spend the UTXO.
Doing so, P2SH also alleviate blockchain data storage since the redeem script is not kept in the UTXO-set database.

Finally, P2SH shifts the burden in data storage for the long script from the present time (locking of funds) to a future 
time (spending of funds).

However puzzles that doesn't require a signature are insecure.
When a transaction is not signed, an attacker can rewrite it to instead send the value to his address.

Except for hard computational puzzles, if we have the redeemScript, we can find the unlocking script.


## What's Next?

Continue "PART THREE: PAY TO SCRIPT HASH" with [7.1: Algebra Puzzle - Legacy P2SH](07_1_P2SH_Algebra_Puzzle.md).
