const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  blast: { 
    tvl: getUniTVL({ 
        factory: '0xD97fFc2041a8aB8f6bc4aeE7eE8ECA485381D088', 
        useDefaultCoreAssets: true, 
        fetchBalances: true, 
    }), 
  },
}