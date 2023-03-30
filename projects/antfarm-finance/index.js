const { uniTvlExport } = require("../helper/calculateUniTvl.js");

module.exports = {
  misrepresentedTokens: true,
  arbitrum: {
    tvl: uniTvlExport(
      "0x61f4ECD130291e5D5D7809A112f9F9081b8Ed3A5",
      "arbitrum",
      undefined,
      undefined,
      { hasStablePools: false, useDefaultCoreAssets: true }
    ),
  },
  ethereum: {
    tvl: uniTvlExport(
      "0xE48AEE124F9933661d4DD3Eb265fA9e153e32CBe",
      "ethereum",
      undefined,
      undefined,
      { hasStablePools: false, useDefaultCoreAssets: true }
    ),
  },
  polygon_zkevm: {
    tvl: uniTvlExport(
      "0x8aF94528FBE3c4C148523E7aAD48BcEbcC0A71d7",
      "polygon_zkevm",
      undefined,
      undefined,
      { hasStablePools: false, useDefaultCoreAssets: true }
    ),
  },
};
