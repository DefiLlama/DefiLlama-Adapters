const { getUniTVL } = require('../helper/unknownTokens')
const {exportDexTVL} = require("../helper/solana")

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: getUniTVL({
      factory: '0x1e895bFe59E3A5103e8B7dA3897d1F2391476f3c', 
      chain: 'bsc', 
      useDefaultCoreAssets: true
    })
  },
  solana:{
    tvl: exportDexTVL("Dooar9JkhdZ7J3LHN3A7YCuoGRUggXhQaG4kijfLGU2j")
  }
};