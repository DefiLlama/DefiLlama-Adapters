const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  methodology: "We count liquidity on the dexes, pulling data from subgraphs",
  kcc: {
    tvl: getUniTVL({ factory: '0x1aDb92364888C9A65e65C287DaE48032681327c8', useDefaultCoreAssets: true, }),
  },
  bsc:{
    tvl: getUniTVL({ factory: '0x092EE062Baa0440B6df6BBb7Db7e66D8902bFdF7', useDefaultCoreAssets: true, }), 
  },
}