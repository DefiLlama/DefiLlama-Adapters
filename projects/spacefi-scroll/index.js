const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  scroll: {
    tvl: getUniTVL({ factory: '0x6cC370Ed99f1C11e7AC439F845d0BA6aed55cf50', useDefaultCoreAssets: true, })
  }
}; 