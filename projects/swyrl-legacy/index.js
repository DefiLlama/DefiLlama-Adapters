const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  monad: {
    tvl: getUniTVL({
      factory: '0xD158CDfeC90E9429A290c3144Afeb72E8C23603a',
      useDefaultCoreAssets: true,
      hasStablePools: true,
      blacklistedTokens: []
    }),
  },
}