const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: getUniTVL({
      factory: '0xD04A80baeeF12fD7b1D1ee6b1f8ad354f81bc4d7', 
      chain: 'bsc', 
      useDefaultCoreAssets: true
    })
  },
};