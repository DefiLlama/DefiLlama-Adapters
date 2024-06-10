const { masterchefExports, } = require('../helper/unknownTokens');
const { mergeExports } = require("../helper/utils");
const abi = require("./abi.json");

module.exports = mergeExports([
  masterchefExports({
    chain: 'fantom',
    masterchef: '0xA6151b608f49Feb960e951F1C87F4C766850de31',
    nativeToken: '0x181f3f22c9a751e2ce673498a03e1fdfc0ebbfb6',
    poolInfoABI: abi.poolInfo
  })
])