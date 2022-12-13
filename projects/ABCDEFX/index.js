const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  methodology: "Using DefiLlama's SDK to make on-chain calls to a Uniswap-like Factory Contract to iterate over Liquidity Pools.",
  xdai:     { tvl: getUniTVL({ chain: 'xdai',     factory: '0x01F43D2A7F4554468f77e06757e707150e39130c',  useDefaultCoreAssets: true, }) },
  fantom:   { tvl: getUniTVL({ chain: 'echelon',  factory: '0x01F43D2A7F4554468f77e06757e707150e39130c',  useDefaultCoreAssets: true, }) },
  kcc:      { tvl: getUniTVL({ chain: 'echelon',  factory: '0x01F43D2A7F4554468f77e06757e707150e39130c',  useDefaultCoreAssets: true, }) },
  echelon:  { tvl: getUniTVL({ chain: 'echelon',  factory: '0x01F43D2A7F4554468f77e06757e707150e39130c',  useDefaultCoreAssets: true, }) },
  multivac: { tvl: getUniTVL({ chain: 'echelon',  factory: '0x01F43D2A7F4554468f77e06757e707150e39130c',  useDefaultCoreAssets: true, }) },
};
