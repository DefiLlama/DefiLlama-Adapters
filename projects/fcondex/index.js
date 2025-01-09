const { getUniTVL } = require("../helper/unknownTokens");
module.exports = {
  misrepresentedTokens: true,
  mantle: {
    tvl: getUniTVL({
      factory: "0x3eF942017d51BA257c4B61BE2f8f641209C8b341",
      useDefaultCoreAssets: true,
      fetchBalanes: true,
    }),
  },
};
