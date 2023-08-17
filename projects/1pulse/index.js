const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  misrepresentedTokens: true,
  pulse: {
    tvl: getUniTVL({
      fetchBalances: true,
      useDefaultCoreAssets: true,
      factory: "0x17C335D22456c798D5A3D021583eDAcbD4Ef6444",
    }),
  },
};
