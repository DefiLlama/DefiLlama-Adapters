const { getUniTVL } = require('../helper/unknownTokens.js')

module.exports = {
  misrepresentedTokens: true,
  arbitrum: {
    tvl: getUniTVL({
      factory: '0xdAF8b79B3C46db8bE754Fc5E98b620ee243eb279',
      useDefaultCoreAssets: true,
      hasStablePools: true,
      fetchBalances: true,
    })
  }
};