const { getRingTVL } = require("../helper/unknownTokens");
module.exports = {
  misrepresentedTokens: true,

  blast: {
    tvl: getRingTVL({
      factory: "0x455b20131D59f01d082df1225154fDA813E8CeE9",
      useDefaultCoreAssets: true,
    }),
  },
};
