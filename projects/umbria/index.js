const { masterchefExports, } = require('../helper/unknownTokens');
const { mergeExports } = require("../helper/utils");

module.exports = mergeExports([
  masterchefExports({
    chain: 'ethereum',
    nativeToken: '0xa4bbe66f151b22b167127c770016b15ff97dd35c',
    masterchef: '0xdF9401225cC62d474C559E9c4558Fb193137bCEB',
  }),
  masterchefExports({
    chain: 'polygon',
    nativeToken: '0x2e4b0fb46a46c90cb410fe676f24e466753b469f',
    masterchef: '0x3756a26De28d6981075a2CD793F89e4Dc5A0dE04',
  })
])