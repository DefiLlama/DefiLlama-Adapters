const { getUniTVL } = require("../helper/unknownTokens");
module.exports = {
  misrepresentedTokens: true,

  blast: {
    tvl: getUniTVL({
      factory: "0x9637ac15c3830d9b32378593693f968cc33eecb1",
      useDefaultCoreAssets: true,
    }),
  },
};
