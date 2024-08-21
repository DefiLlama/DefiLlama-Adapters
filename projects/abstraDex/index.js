const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  misrepresentedTokens: true,
  zkfair: {
    tvl: getUniTVL({
      factory: "0x174c4C03DfeA09682728A5959A253bf1F7C7766F",
      useDefaultCoreAssets: true,
    }),
  },

  zeta: {
    tvl: getUniTVL({
      factory: "0x174c4C03DfeA09682728A5959A253bf1F7C7766F",
      useDefaultCoreAssets: true,
    }),
  },

  cronos_zkevm: {
    tvl: getUniTVL({
      factory: "0x76D1fC018676f8A973474C24F40A2e14e401b770",
      useDefaultCoreAssets: true,
    }),
  },
};
