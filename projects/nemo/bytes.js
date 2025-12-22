const ADDRESSES = require('../helper/coreAssets.json')
const hexToBytes = (hex) => Array.from(Buffer.from(hex.replace(/^0x/, ""), 'hex'));

const textToBytes = (value) => new TextEncoder().encode(value);

const toU64 = (value) => toLittleEndian(BigInt(value), 8);

const toU128 = (value) => toLittleEndian(BigInt(value), 16);

function toLittleEndian(bigint, size) {
  let result = new Uint8Array(size);
  let i = 0;
  while (bigint > 0) {
    result[i] = Number(bigint % BigInt(256));
    bigint = bigint / BigInt(256);
    i += 1;
  }
  return result;
}

function desU64(data, offset = 0) {
  const dataView = new DataView(Uint8Array.from(data).buffer);
  let value1 = dataView.getUint32(offset, true);
  let value2 = dataView.getUint32(offset + 4, true);
  return (BigInt(value2) << BigInt(32)) | BigInt(value1);
}

function desU128(data, offset = 0) {
  const dataView = new DataView(Uint8Array.from(data).buffer);
  let value1 = dataView.getUint32(offset, true);
  let value2 = dataView.getUint32(offset + 4, true);
  let value3 = dataView.getUint32(offset + 8, true);
  let value4 = dataView.getUint32(offset + 12, true);
  return (BigInt(value4) << BigInt(96)) | (BigInt(value3) << BigInt(64)) | (BigInt(value2) << BigInt(32)) | BigInt(value1);
}

// console.log(JSON.stringify(Array.from(hexToBytes('0x2'))))
// console.log(JSON.stringify(Array.from(textToBytes('coin'))))
// console.log(JSON.stringify(Array.from(textToBytes('balance_mut'))))
// console.log(JSON.stringify(hexToBytes('0x1570fc89d472ebd7f0926028a261575289983cc69a928e42330c0cf6d0e24861')))
// console.log(JSON.stringify(hexToBytes('0xeb0fd6ce92111543c021fad91034743d8b25992e4d7ffe3d3e907dc5fa1b8698')))
// console.log(JSON.stringify(hexToBytes('0x15eda7330c8f99c30e430b4d82fd7ab2af3ead4ae17046fcb224aa9bad394f6b')))
// console.log(JSON.stringify(hexToBytes('0xccd3898005a269c1e9074fe28bca2ff46784e8ee7c13b576862d9758266c3a4d')))
// console.log(JSON.stringify(hexToBytes('0x0330bbb1df8d16c52e347bb797dddca9dcac08c1362502ad8cc830bc3aa7250b')))
// console.log(JSON.stringify(hexToBytes('0x4a8d13937be10f97e450d1b8eb5846b749f9d3f470243b6cfa660e3d75b1fc49')))
// console.log(JSON.stringify(hexToBytes('0xf8b4342324f0cfa17998beacfd5f8cfed85f0f7c8a6b567c65796dfdb1a75c9c')))
// console.log(JSON.stringify(hexToBytes('0x0000000000000000000000000000000000000000000000000000000000000006')))
// console.log(toU64(1000))

module.exports = {
  hexToBytes,
  toU64,
  toU128,
  textToBytes,
  desU64,
  desU128,
};
