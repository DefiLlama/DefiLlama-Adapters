const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0x3e2Ea9B92B7E48A52296fD261dc26fd995284631",
          "0x1a0ad011913A150f69f6A19DF447A0CfD9551054",
        ],
        fetchCoValentTokens: true,
      }),
  },
};
