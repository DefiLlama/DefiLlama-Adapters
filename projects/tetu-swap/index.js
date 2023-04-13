const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  polygon: {
    tvl: getUniTVL({
      chain: 'polygon',
      useDefaultCoreAssets: true,
      factory: '0x684d8c187be836171a1af8d533e4724893031828',
    }),    
  }
};