
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
};

