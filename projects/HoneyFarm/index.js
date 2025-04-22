const { masterchefExports, } = require('../helper/unknownTokens');
const { mergeExports } = require("../helper/utils");

module.exports = mergeExports([
  masterchefExports({
    chain: 'avax',
    masterchef: '0x757490104fd4C80195D3C56bee4dc7B1279cCC51',
    nativeToken: '0xB669c71431bc4372140bC35Aa1962C4B980bA507',
    blacklistedTokens: ['0x1ce0c2827e2ef14d5c4f29a091d735a204794041']
  }),
  masterchefExports({
    chain: 'bsc',
    masterchef: '0x88E21dedEf04cf24AFe1847B0F6927a719AA8F35',
    nativeToken: '0x1A8d7AC01d21991BF5249A3657C97b2B6d919222',
  })
])