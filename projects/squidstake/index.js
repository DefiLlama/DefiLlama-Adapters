const squidToken = "0xAE61e7dc989718E700C046a2483e93513eDCA484";
const masterchef = "0x86A47ddD4c6522251d6a5A5800f3F24c03332CB4";

const { masterchefExports, } = require('../helper/unknownTokens')

module.exports = masterchefExports({
  chain: 'bsc',
  masterchef,
  nativeToken: squidToken,
})