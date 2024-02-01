const { getUniTVL } = require("../helper/unknownTokens")

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: getUniTVL({ factory: '0x06530550A48F990360DFD642d2132354A144F31d', useDefaultCoreAssets: true, }),
  },
  cronos: {
    tvl: getUniTVL({ factory: '0x06530550A48F990360DFD642d2132354A144F31d', useDefaultCoreAssets: true, }),
  },
  xdai: {
    tvl: getUniTVL({ factory: '0x06530550A48F990360DFD642d2132354A144F31d', useDefaultCoreAssets: true, }),
  },
  polygon: {
    tvl: getUniTVL({ factory: '0x06530550A48F990360DFD642d2132354A144F31d', useDefaultCoreAssets: true, }),
  },
  fantom: {
    tvl: getUniTVL({ factory: '0x06530550A48F990360DFD642d2132354A144F31d', useDefaultCoreAssets: true, }),
  },
  avax: {
    tvl: getUniTVL({ factory: '0x06530550A48F990360DFD642d2132354A144F31d', useDefaultCoreAssets: true, }),
  },
  ethereum: {
    tvl: getUniTVL({ factory: '0xd674b01E778CF43D3E6544985F893355F46A74A5', useDefaultCoreAssets: true, }),
  },
  kava: {
    tvl: getUniTVL({ factory: '0x06530550A48F990360DFD642d2132354A144F31d', useDefaultCoreAssets: true, }),
  },
  empire: {
    // tvl: getUniTVL({ factory: '0x06530550A48F990360DFD642d2132354A144F31d', useDefaultCoreAssets: true, }),
    tvl: () => ({}),
  },

  methodology: "Factory address(0x06530550A48F990360DFD642d2132354A144F31d) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
};
