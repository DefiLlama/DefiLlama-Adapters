const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  op_bnb: {
    tvl: getUniTVL({
      factory: "0x0f93649C2BA0F64fA939eCe899f1afD0b15C7Bd2",
      useDefaultCoreAssets: true,
    }),
  },
};
