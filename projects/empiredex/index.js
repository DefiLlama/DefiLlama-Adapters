const { getUniTVL } = require("../helper/unknownTokens")

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: getUniTVL({ chain: 'bsc', factory: '0x06530550A48F990360DFD642d2132354A144F31d', useDefaultCoreAssets: true, }),
  },
  cronos: {
    tvl: getUniTVL({ chain: 'cronos', factory: '0x06530550A48F990360DFD642d2132354A144F31d', useDefaultCoreAssets: true, }),
  },
  xdai: {
    tvl: getUniTVL({ chain: 'xdai', factory: '0x06530550A48F990360DFD642d2132354A144F31d', useDefaultCoreAssets: true, }),
  },
  polygon: {
    tvl: getUniTVL({ chain: 'polygon', factory: '0x06530550A48F990360DFD642d2132354A144F31d', useDefaultCoreAssets: true, }),
  },
  fantom: {
    tvl: getUniTVL({ chain: 'fantom', factory: '0x06530550A48F990360DFD642d2132354A144F31d', useDefaultCoreAssets: true, }),
  },
  avax: {
    tvl: getUniTVL({ chain: 'avax', factory: '0x06530550A48F990360DFD642d2132354A144F31d', useDefaultCoreAssets: true, }),
  },
  ethereum: {
    tvl: getUniTVL({ chain: 'ethereum', factory: '0xd674b01E778CF43D3E6544985F893355F46A74A5', useDefaultCoreAssets: true, }),
  },
  kava: {
    tvl: getUniTVL({
        factory: '0x06530550A48F990360DFD642d2132354A144F31d',
        chain: 'kava',
        useDefaultCoreAssets: true,
    }),
  },
  empire: {
    tvl: getUniTVL({ chain: 'empire', factory: '0x06530550A48F990360DFD642d2132354A144F31d', useDefaultCoreAssets: true, }),
  },
  
  methodology: "Factory address(0x06530550A48F990360DFD642d2132354A144F31d) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
};
