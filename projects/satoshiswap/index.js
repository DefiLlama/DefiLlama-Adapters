const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  core: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: '0x8f5c03a1c86bf79ae0baC0D72E75aee662083e26',
    })
  }
}