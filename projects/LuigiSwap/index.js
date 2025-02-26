const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  misrepresentedTokens: true,
  op_bnb: {
    tvl: getUniTVL({
      factory: "0x0dAe6d22182c20AB9150a4DCB3160591Dc41027a",
      useDefaultCoreAssets: true,
    }),
  },
  scroll: {
    tvl: getUniTVL({
      factory: "0x0dAe6d22182c20AB9150a4DCB3160591Dc41027a",
      useDefaultCoreAssets: true,
    }),
  },
};
