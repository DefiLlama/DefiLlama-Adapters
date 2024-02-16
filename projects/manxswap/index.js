const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  misrepresentedTokens: true,
  manta: {
    tvl: getUniTVL({
      factory: "0xFF073cEd2867F7085eC058f5C5Bd6Cf0d9B1Af8f",
      useDefaultCoreAssets: true,
      fetchBalances: true,
    }),
  },
};
