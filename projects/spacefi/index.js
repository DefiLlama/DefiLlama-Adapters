const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  evmos: {
    tvl: getUniTVL({
      factory: '0x868A71EbfC46B86a676768C7b7aD65055CC293eE',
      useDefaultCoreAssets: true,
    })
  },
  scroll: {
    tvl: getUniTVL({ factory: '0x6cC370Ed99f1C11e7AC439F845d0BA6aed55cf50', useDefaultCoreAssets: true, })
  }
}; 
