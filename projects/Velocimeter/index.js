const { getUniTVL } = require('../helper/unknownTokens')
const { staking } = require('../helper/staking')

module.exports = {
  misrepresentedTokens: true,
  canto: {
    tvl: getUniTVL({
      factory: '0xb12aF64E128A1D4489D13314eB4Df81cBCE126aC',
      useDefaultCoreAssets: true,
      hasStablePools: true,
    }),
    staking: staking(
      '0x990efF367C6c4aece43c1E98099061c897730F27',
      '0x2Baec546a92cA3469f71b7A091f7dF61e5569889',
      'canto'
    )
  }
}
