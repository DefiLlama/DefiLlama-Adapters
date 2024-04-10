const { getUniTVL } = require('../helper/unknownTokens')
module.exports = {
  meter:{
    tvl: getUniTVL({ factory: '0x56aD9A9149685b290ffeC883937caE191e193135', useDefaultCoreAssets: true }),
  },
  theta:{
    tvl: getUniTVL({ factory: '0xa2De4F2cC54dDFdFb7D27E81b9b9772bd45bf89d', useDefaultCoreAssets: true }),
  },
}
