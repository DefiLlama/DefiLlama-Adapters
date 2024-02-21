const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  misrepresentedTokens: true,
  polygon: {
    tvl: getUniTVL({
      factory: "0x30030Aa4bc9bF07005cf61803ac8D0EB53e576eC",
      hasStablePools: true,
      useDefaultCoreAssets: true,
    }),
  },
};
