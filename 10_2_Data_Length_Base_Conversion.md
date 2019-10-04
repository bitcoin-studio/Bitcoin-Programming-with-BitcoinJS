# 10.2: Data Length and Base Conversion

As a bitcoin programmer, it is often useful to know the length of some data or convert to a different base.
The file [baseConverter.js](code/baseConverter.js) provides a very simple tool box to do just that. 


## Calculate the byte length of alice_1 pubKeyHash  
> `lenBytesHex` takes data in binary and returns the byte length expressed in hexadecimal 
```
$ convert.lenBytesHex(convert.hex2bin('fb8820f35effa054399540b8ca86040d8ddaa4d5'))
```
Result: 14

If we want to push a hash160 onto the stack we will use a PUSHBYTES_14, which is actually 20 bytes in decimal.

```
$ convert.lenBytesDec(convert.hex2bin('fb8820f35effa054399540b8ca86040d8ddaa4d5'))
```
Result: 20