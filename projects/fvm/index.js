const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  fantom: {
    tvl: getUniTVL({
      factory: '0x472f3C3c9608fe0aE8d702f3f8A2d12c410C881A',
      useDefaultCoreAssets: true,
      hasStablePools: true,
    })
  }
}
