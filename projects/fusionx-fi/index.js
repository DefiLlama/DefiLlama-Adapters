const { getUniTVL } = require("../helper/unknownTokens");
module.exports = {
  misrepresentedTokens: true,
  mantle: {
    tvl: getUniTVL({
      factory: "0xe5020961fa51ffd3662cdf307def18f9a87cce7c",
      useDefaultCoreAssets: true,
    }),
  },
};
