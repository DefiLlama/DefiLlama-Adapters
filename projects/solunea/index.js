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
}
