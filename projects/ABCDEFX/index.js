const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  methodoogy: "Using DefiLlama's SDK to make on-chain calls to a Uniswap-like Factory Contract to iterate over Liquidity Pools.",
  xdai:     { tvl: getUniTVL({ chain: 'xdai',     factory: '0xbBD6e78961b13498F313883632D315ebD4Adbd6D',  useDefaultCoreAssets: true, }) },
  fantom:   { tvl: getUniTVL({ chain: 'echelon',  factory: '0xbBD6e78961b13498F313883632D315ebD4Adbd6D',  useDefaultCoreAssets: true, }) },
  kcc:      { tvl: getUniTVL({ chain: 'echelon',  factory: '0xbBD6e78961b13498F313883632D315ebD4Adbd6D',  useDefaultCoreAssets: true, }) },
  echelon:  { tvl: getUniTVL({ chain: 'echelon',  factory: '0xbBD6e78961b13498F313883632D315ebD4Adbd6D',  useDefaultCoreAssets: true, }) },
  multivac: { tvl: getUniTVL({ chain: 'echelon',  factory: '0xbBD6e78961b13498F313883632D315ebD4Adbd6D',  useDefaultCoreAssets: true, }) },
};
