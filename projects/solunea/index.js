const { getUniTVL } = require('../helper/unknownTokens.js')

module.exports = {
  misrepresentedTokens: true,
  era: {
    tvl: getUniTVL({
      factory: '0x5892Dc61d3f243Fa397197BaBC3Bb709Af4a0787',
      useDefaultCoreAssets: true,
      hasStablePools: true,
    })
  },
  arbitrum: {
    tvl: getUniTVL({
      factory: '0x6ef065573cd3fff4c375d4d36e6ca93cd6e3d499',
      useDefaultCoreAssets: true,
      hasStablePools: true,
    })
  },
}
