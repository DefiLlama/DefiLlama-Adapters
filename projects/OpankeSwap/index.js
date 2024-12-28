const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  misrepresentedTokens: true,
  op_bnb: {
    tvl: getUniTVL({
      factory: "0x4523A7f5414bAc9BfbDfc6eF0932Bf580C3cf9f1",
      useDefaultCoreAssets: true,
    }),
  },
};
