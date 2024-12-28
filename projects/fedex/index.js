const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  misrepresentedTokens: true,
  op_bnb: {
    tvl: getUniTVL({
      factory: "0xfb3AD00B272449AF3ea44e5C6ADbdfaB1655A046",
      useDefaultCoreAssets: true,
    }),
  },
};
