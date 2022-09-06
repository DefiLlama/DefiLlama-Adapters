const { getUniTVL } = require('../helper/unknownTokens')


module.exports = {
  misrepresentedTokens: true,
  vision: {
    tvl: getUniTVL({
      chain: 'vision',
      useDefaultCoreAssets: true,
      factory: '0xF6D67482DEDE4D208F74CCD0E6592764014F546F',
    }),
    
  }
}; 