const { masterchefExports, } = require('../helper/unknownTokens');
const { mergeExports } = require("../helper/utils");

module.exports = mergeExports([
  masterchefExports({
    chain: 'arbitrum',
    masterchef: '0x6b614684742717114200dc9f30cBFdCC00fc73Ec',
    nativeToken: '0x2c852d3334188be136bfc540ef2bb8c37b590bad',
  }),
  masterchefExports({
    chain: 'iotex',
    masterchef: '0x9B4CF5d754455fD3Bc4212DCFF1b085DBCd5b0c0',
  })
])