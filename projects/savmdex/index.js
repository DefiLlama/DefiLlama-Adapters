const { getUniTVL } = require("../helper/unknownTokens");
module.exports = {
  misrepresentedTokens: true,

  bevm: {
    tvl: getUniTVL({
      factory: "0xc008f29AaddA007b123919a5a0561c1B2E37864A",
      useDefaultCoreAssets: true,
    }),
  },
};
