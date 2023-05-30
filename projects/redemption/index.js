const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  fantom: {
    tvl: getUniTVL({
      factory: '0xa2dF50d1401afF182D19Bb41d76cf35953942c51', 
      chain: 'fantom', 
      useDefaultCoreAssets: true
    })
  },
};