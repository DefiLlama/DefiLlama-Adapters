const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: "TVL is calculated by summing the reserves of all DEX pairs on KUB.",
  bitkub: {
    tvl: getUniTVL({
      factory: '0xe8150dCfe6De2c7EFc2e9f96C09d6b83106Af1dE',
      useDefaultCoreAssets: true,
      fetchBalances: true,
    }),
  },
};
