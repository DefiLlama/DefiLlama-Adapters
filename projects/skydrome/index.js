const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  scroll: {
    tvl: getUniTVL({
      factory: '0x2516212168034b18a0155FfbE59f2f0063fFfBD9',
      useDefaultCoreAssets: true,
      hasStablePools: true,
    })
  },
}
