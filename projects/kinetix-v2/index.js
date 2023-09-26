const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  misrepresentedTokens: true,
  kava: {
    tvl: getUniTVL({
      factory: "0xE8E917BC80A26CDacc9aA42C0F4965d2E1Fa52da",
      useDefaultCoreAssets: true,
      fetchBalances: true,
    }),
  },
};
