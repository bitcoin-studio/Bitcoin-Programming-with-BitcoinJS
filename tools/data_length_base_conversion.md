# Data Length and Base Conversion

As a bitcoin programmer, it is often useful to know the length of some data or convert to a different base. The file [baseConverter.js](https://github.com/bitcoin-studio/Bitcoin-Programming-with-BitcoinJS/blob/master/code/baseConverter.js) provides a very simple tool box to do just that.

## Convert base

```text
$ convert.hex2dec(10)
16
```

## Calculate the byte length of alice\_1 pubKeyHash

> `lenBytesHex` takes a hex string and returns the byte length expressed in hexadecimal
>
> ```text
> $ convert.lenBytesHex('fb8820f35effa054399540b8ca86040d8ddaa4d5')
> 14
> ```

If we want to push this pubKeyHash onto the stack we will use a PUSHBYTES\_14, which is actually 20 bytes in decimal.

> `lenBytesDec` takes a hex string and returns the byte length expressed in decimal
>
> ```text
> $ convert.lenBytesDec('fb8820f35effa054399540b8ca86040d8ddaa4d5')
> 20
> ```

