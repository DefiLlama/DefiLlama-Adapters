const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  ethpow: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: '0xf66cef53c518659bFA0A9a4Aa07445AF08bf9B3a',
    })
  }
}