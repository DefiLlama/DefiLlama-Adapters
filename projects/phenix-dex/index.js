const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  methodology: `TVL of staked assets across the Phenix DEX on both Cronos Mainnet and Polygon POS chains.`,
  cronos: {
    tvl: getUniTVL({
      factory: "0x6Bae09822c36a9359d563A22fc7d134eF27a5f60",
      useDefaultCoreAssets: true,
    }),
  },
  polygon: {
    tvl: getUniTVL({
      factory: "0x9A3F01dfA086C2E234fC88742c692368438fBb30",
      useDefaultCoreAssets: true,
    }),
  },
};
