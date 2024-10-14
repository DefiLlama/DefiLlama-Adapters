const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  misrepresentedTokens: true,
  flare: {
    tvl: getUniTVL({
      factory: "0x16b619B04c961E8f4F06C10B42FDAbb328980A89",
      useDefaultCoreAssets: true,
    }),
  },
};
