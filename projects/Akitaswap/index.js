const { getUniTVL } = require("../helper/unknownTokens");
module.exports = {
  misrepresentedTokens: true,

  blast: {
    tvl: getUniTVL({
      factory: "0x27C429dfF0e6d3B43B2C404C35f58C2b36cef916",
      useDefaultCoreAssets: true,
    }),
  },
};