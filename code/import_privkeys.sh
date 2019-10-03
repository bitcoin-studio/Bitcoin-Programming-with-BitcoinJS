#!/usr/bin/env bash

count=0
wallets=(alice_1 alice_2 alice_3 bob_1 bob_2 bob_3 carol_1 carol_2 carol_3 dave_1 dave_2 dave_3 eve_1 eve_2 eve_3 mallory_1 mallory_2 mallory_3)

# Returns all wif without null values
cat wallets.json | jq -r '.[][] | (.wif // empty)' |
# Iterate
while read -r wif
do
  bitcoin-cli importprivkey ${wif} ${wallets[count]}
  ((count ++))
done