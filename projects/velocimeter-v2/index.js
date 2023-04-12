const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  canto: {
    tvl: getUniTVL({
      factory: '0xF80909DF0A01ff18e4D37BF682E40519B21Def46',
      fetchBalances: true,
      useDefaultCoreAssets: true,
      hasStablePools: true,
    })
  }
}
