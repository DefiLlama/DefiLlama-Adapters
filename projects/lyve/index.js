const { getUniTVL } = require('../helper/unknownTokens.js')

module.exports = {
  misrepresentedTokens: true,
  linea: {
    tvl: getUniTVL({
      factory: '0xA75436A74a9F5C7a8892F907ff37e15c558d41b0',
      useDefaultCoreAssets: true,
      hasStablePools: true,
      fetchBalances: true,
    })
  }
}