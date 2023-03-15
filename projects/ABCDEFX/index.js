const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  methodology: "Using DefiLlama's SDK for making on-chain calls to ABcDeFX Factory Contract to iterate over Liquidity Pools & count token balances therein.",
  fantom:   { tvl: getUniTVL({ chain: 'fantom',   factory: '0x01F43D2A7F4554468f77e06757e707150e39130c',  useDefaultCoreAssets: true, }) },
  kcc:      { tvl: getUniTVL({ chain: 'kcc',      factory: '0x01F43D2A7F4554468f77e06757e707150e39130c',  useDefaultCoreAssets: true, }) },
  echelon:  { tvl: getUniTVL({ chain: 'echelon',  factory: '0x01F43D2A7F4554468f77e06757e707150e39130c',  useDefaultCoreAssets: true, }) },
  multivac: { tvl: getUniTVL({ chain: 'multivac', factory: '0x01F43D2A7F4554468f77e06757e707150e39130c',  useDefaultCoreAssets: true, }) },
  kava:     { tvl: getUniTVL({ chain: 'kava',     factory: '0x01F43D2A7F4554468f77e06757e707150e39130c',  useDefaultCoreAssets: true, }) },
};
