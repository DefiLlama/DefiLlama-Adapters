const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: false,
  bsc: {
    tvl: getUniTVL({
      factory: '0xa053582601214FEb3778031a002135cbBB7DBa18', 
      chain: 'bsc', 
      useDefaultCoreAssets: false
    })
  },
};