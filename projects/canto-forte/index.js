const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  canto: {
    tvl: getUniTVL({
      factory: '0x759e390D946249c63e0A1d8a810C5A577a591719',
      useDefaultCoreAssets: true,
    })
  }
}