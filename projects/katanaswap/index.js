const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  misrepresentedTokens: true,
  zeta: {
    tvl: getUniTVL({
      factory: "0xc6ef2008a5a717329648420F429dA53d3351cF5E",
      useDefaultCoreAssets: true,
    }),
  },
};
