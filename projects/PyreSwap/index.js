const { getUniTVL } = require('../helper/unknownTokens');
const factory = "0x045d720873f0260e23da812501a7c5930e510aa4"
module.exports = {
  misrepresentedTokens: true,
  ftm: {
    tvl: getUniTVL({
      chain: 'fantom',
      factory: factory,
      useDefaultCoreAssets: true,
    }),
  },
  bsc: {
    tvl: getUniTVL({
      chain: 'bsc', 
      factory: factory, 
      useDefaultCoreAssets: true,
    }),
  },
  avax: {
    tvl: getUniTVL({
      chain: 'avax', 
      factory: factory, 
      useDefaultCoreAssets: true,
    }),
  },
};
