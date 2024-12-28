const { getUniTVL } = require('../helper/unknownTokens.js')

module.exports = {
  misrepresentedTokens: true,
  arbitrum:{
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      hasStablePools: true,
      factory: '0x734d84631f00dC0d3FCD18b04b6cf42BFd407074',
    }),
  },
}
