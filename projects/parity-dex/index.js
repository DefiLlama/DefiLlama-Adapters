const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  monad: {
    tvl: getUniTVL({ factory: '0x6DBb0b5B201d02aD74B137617658543ecf800170', useDefaultCoreAssets: true, hasStablePools: true }),
  },
}
