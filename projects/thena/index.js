const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: getUniTVL({
      factory: "0xafd89d21bdb66d00817d4153e055830b1c2b3970",
      useDefaultCoreAssets: true,
    }),
  },
  op_bnb: {
    tvl: getUniTVL({
      factory: "0xFC1bC666A98703505534477E651A2470508C99A4",
      useDefaultCoreAssets: true,
    }),
  },
};
