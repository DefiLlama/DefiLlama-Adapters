const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  hyperliquid: {
    tvl: getUniTVL({
      factory: '0x889fd0ada8453c7619cd7f11e9029a1f0848fdf5', 
      useDefaultCoreAssets: true,
      hasStablePools: true
    })
  },
};