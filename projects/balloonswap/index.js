const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  misrepresentedTokens: true,
  op_bnb: {
    tvl: getUniTVL({
      factory: "0xCF8B8Ca7B70880c90C635672eB3D4882a52B4890",
      useDefaultCoreAssets: true,
    }),
  },
};
