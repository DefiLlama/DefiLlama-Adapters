const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: getUniTVL({
      factory: '0x80f112CD8Ac529d6993090A0c9a04E01d495BfBf', 
      chain: 'bsc', 
      useDefaultCoreAssets: true
    })
  },
};