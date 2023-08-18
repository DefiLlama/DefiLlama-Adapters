const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  op_bnb: {
    tvl: getUniTVL({
      factory: "0x2fDb7b3f5C36f4209F23A657B35121AD1d7aBE1A",
      useDefaultCoreAssets: true,
    }),
  },
};
