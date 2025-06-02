const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  core: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: '0x97814a1F542aFe7fd02de53926621b0D40e8Ad6C',
    })
  }
}