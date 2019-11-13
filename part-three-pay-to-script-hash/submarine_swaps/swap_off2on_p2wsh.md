# Reverse Submarine Swap - Off-chain to On-chain

A bitcoin user (alice_1) would like to pay off-chain a merchant (bob_1) selling a good on-chain, using a *swap provider* (dave_1).
Technically alice_1 could operate the swap provider herself, but we will suppose here that the *swap provider* is a trustless third party.

Here is the procedure: TODO
* The merchant starts by generating a Lightning invoice.
* The merchant transmits the *payment hash* of this invoice to swap provider. 
* The swap provider creates the P2WSH HTLC swap smart contract and generates its bitcoin address.
* The swap provider prompts the user to pay this bitcoin address. 
* Once the swap contract has been paid and confirmed, the swap provider pay the Lightning invoice.
* The _payment preimage_ is revealed which allows him to redeem the funds locked in the swap contract.
* Lastly, if the swap provider fails to pay the Lightning invoice, the user can redeem the funds after a timelock.

## Generating a Lightning invoice

## Creating and Funding the P2WSH swap contract

## Preparing the spending transaction

### Adding the witness data

## Observations

## What's Next?