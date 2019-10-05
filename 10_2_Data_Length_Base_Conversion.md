# 10.2: Data Length and Base Conversion

As a bitcoin programmer, it is often useful to know the length of some data or convert to a different base.
The file [baseConverter.js](code/baseConverter.js) provides a very simple tool box to do just that. 

## Convert base
```
$ convert.hex2dec(10)
16 
```


## Calculate the byte length of alice_1 pubKeyHash  
> `lenBytesHex` takes a hex string and returns the byte length expressed in hexadecimal 
```
$ convert.lenBytesHex('fb8820f35effa054399540b8ca86040d8ddaa4d5')
14
```

If we want to push this pubKeyHash onto the stack we will use a PUSHBYTES_14, which is actually 20 bytes in decimal.

> `lenBytesDec` takes a hex string and returns the byte length expressed in decimal 
```
$ convert.lenBytesDec('fb8820f35effa054399540b8ca86040d8ddaa4d5')
20
```