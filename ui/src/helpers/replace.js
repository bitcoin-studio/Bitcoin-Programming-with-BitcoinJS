'use strict'

module.exports = (str, from, to) => {
  let newStr
  if (typeof str !== 'string') {
    newStr = str
      .toString()
      .replace(from, to)
  } else {
    newStr = str.replace(from, to)
  }
  return newStr
}
