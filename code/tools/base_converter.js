const bin2dec = s => parseInt(s, 2).toString(10)
const bin2hex = s => parseInt(s, 2).toString(16)
const dec2bin = s => parseInt(s, 10).toString(2)
const dec2hex = s => parseInt(s, 10).toString(16)
const hex2bin = s => parseInt(s, 16).toString(2)
const hex2dec = s => parseInt(s, 16).toString(10)
const lenBytesDec = s => (s.length / 2)
const lenBytesHex = s => dec2hex(s.length / 2)

module.exports = {
  bin2dec,
  bin2hex,
  dec2bin,
  dec2hex,
  hex2bin,
  hex2dec,
  lenBytesDec,
  lenBytesHex
}