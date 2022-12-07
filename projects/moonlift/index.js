const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: getUniTVL({
      factory: '0xe9cABbC746C03010020Fd093cD666e40823E0D87', 
      chain: 'bsc', 
      useDefaultCoreAssets: true
    })
  },
};