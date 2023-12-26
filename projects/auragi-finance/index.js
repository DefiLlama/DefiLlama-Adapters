const { getUniTVL } = require('../helper/unknownTokens.js')

module.exports = {
  misrepresentedTokens: true,
  arbitrum:{
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      hasStablePools: true,
      factory: '0xa36b55DBe8e83Eb69C686368cF93ABC8A238CC5f',
    }),
  },
}
