const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: getUniTVL({
      factory: '0x1e895bFe59E3A5103e8B7dA3897d1F2391476f3c', 
      chain: 'bsc', 
      useDefaultCoreAssets: true
    })
  },
};