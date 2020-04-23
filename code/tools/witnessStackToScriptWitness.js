const varuint = require('varuint-bitcoin')

/**
 * Helper function that produces a serialized witness script
 * https://github.com/bitcoinjs/bitcoinjs-lib/blob/master/test/integration/csv.spec.ts#L477
 * @param witness
 * @returns {Buffer}
 */
function witnessStackToScriptWitness(witness) {
  let buffer = Buffer.allocUnsafe(0)

  function writeSlice(slice) {
    buffer = Buffer.concat([buffer, Buffer.from(slice)])
  }

  function writeVarInt(i) {
    const currentLen = buffer.length;
    const varintLen = varuint.encodingLength(i)

    buffer = Buffer.concat([buffer, Buffer.allocUnsafe(varintLen)])
    varuint.encode(i, buffer, currentLen)
  }

  function writeVarSlice(slice) {
    writeVarInt(slice.length)
    writeSlice(slice)
  }

  function writeVector(vector) {
    writeVarInt(vector.length)
    vector.forEach(writeVarSlice)
  }

  writeVector(witness)

  return buffer
}

module.exports = witnessStackToScriptWitness