const { getUniTVL } = require("../helper/unknownTokens");

const factory = "0x9c60c867ce07a3c403e2598388673c10259ec768";

module.exports = {
  avax: {
    tvl: getUniTVL({
      factory,
      chain: 'avax',
      useDefaultCoreAssets: true,
    }),
  },
};