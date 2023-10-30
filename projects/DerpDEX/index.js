const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  era: {
    tvl: getUniTVL({
      factory: "0x52a1865eb6903bc777a02ae93159105015ca1517",
      useDefaultCoreAssets: true, 
      fetchBalances: true, 
      permitFailure: true
    })
  },
  base: {
    tvl: getUniTVL({
      factory: "0xeddef4273518b137cdbcb3a7fa1c6a688303dfe2",
      useDefaultCoreAssets: true, 
      fetchBalances: true, 
      permitFailure: true
    })
  },
  op_bnb: {
    tvl: getUniTVL({
      factory: "0xb91331Ea9539ee881e3A45191076c454E482dAc7",
      useDefaultCoreAssets: true, 
      fetchBalances: true, 
      permitFailure: true
    })
  }
};
