const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: getUniTVL({
      factory: '0xb664bdce35b5ee182e8832d4f3b615232e98a51e', 
      chain: 'bsc', 
      useDefaultCoreAssets: true
    })
  },
};