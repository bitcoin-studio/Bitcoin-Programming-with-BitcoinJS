const convert = {
  bin2dec : s => parseInt(s, 2).toString(10),
  bin2hex : s => parseInt(s, 2).toString(16),
  dec2bin : s => parseInt(s, 10).toString(2),
  dec2hex : s => parseInt(s, 10).toString(16),
  hex2bin : s => parseInt(s, 16).toString(2),
  hex2dec : s => parseInt(s, 16).toString(10),
  lenBytesDec: s => (s.length / 2),
  lenBytesHex: s => convert.dec2hex(s.length / 2),
}