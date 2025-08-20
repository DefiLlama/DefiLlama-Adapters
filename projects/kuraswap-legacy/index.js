const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  sei: {
    tvl: getUniTVL({
      factory: '0xAEbdA18889D6412E237e465cA25F5F346672A2eC',
      useDefaultCoreAssets: true,
      hasStablePools: true
    }),
  },
}