const { getUniTVL } = require('../helper/unknownTokens.js')

module.exports = {
  misrepresentedTokens: true,
  arbitrum: {
    tvl: getUniTVL({ factory: '0x989CF6bFA8997E8A01Fa07F3009392d1C734c719', useDefaultCoreAssets: true,  hasStablePools: true, }),
  },
}
