# Number Encoding

Numbers in Bitcoin script require to be encoded in little endian hexadecimal. 
BitcoinJS takes care of that, but in case you need it there is a bash script for that, [int2lehex.sh](../code/tools/int2lehex.sh).

Instructions:

```bash
$ cd code/tools
$ int2lehex.sh 42 
Integer: 42
LE Hex: 2a
Length: 1 bytes
Hexcode: 012a
```

If you have a `permission denied` error, run:

```bash
chmod 755 int2lehex.sh
```