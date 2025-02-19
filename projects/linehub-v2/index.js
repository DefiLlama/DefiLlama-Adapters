const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  misrepresentedTokens: true,
  linea: {
    tvl: getUniTVL({
      factory: "0x7811DeF28977060784cC509641f2DD23584b7671",
      useDefaultCoreAssets: true,
    }),
  },
};
