const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  blast: {
    tvl: getUniTVL({
      factory: '0xa19c51d91891d3df7c13ed22a2f89d328a82950f', 
      useDefaultCoreAssets: true,
      hasStablePools: true
    })
  },
};