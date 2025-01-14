const { getUniTVL } = require("../helper/unknownTokens");
module.exports = {
  misrepresentedTokens: true,
  polygon: {
    tvl: getUniTVL({
      factory: "0xf08ae17c2a2728a788bb1b6c243fe7eb3e5bbadc",
      useDefaultCoreAssets: true,
    }),
  },
};
