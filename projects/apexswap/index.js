const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  hallmarks: [
    [1665532800, "Rug Pull"]
  ],
  avax: {
    tvl: getUniTVL({
      factory: '0x21cadeb92c8bbfbef98c3098846f0999209c3a97', 
      chain: 'avax', 
      useDefaultCoreAssets: true
    })
  },
};