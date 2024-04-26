const { masterchefExports, } = require('../helper/unknownTokens');
const { mergeExports } = require("../helper/utils");

module.exports = mergeExports([
  masterchefExports({
    chain: 'bsc',
    masterchef: '0xea2822047194f0cb21d8c79b2d93aaa42f3b9b5a',
    nativeToken: '0x9df9de5ed89adbbd9fa2c14691903a0de9048a87,
  })
])
