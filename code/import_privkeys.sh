#!/usr/bin/env bash

count=0
wallets=(alice alice alice bob bob bob carol carol carol dave dave dave eve eve eve mallory mallory mallory)

cat wallets.json | jq -r '.[][].wif' |
while read -r wif
do
  bitcoin-cli importprivkey ${wif} "autogen_${wallets[count]}" false
  ((count ++))
done