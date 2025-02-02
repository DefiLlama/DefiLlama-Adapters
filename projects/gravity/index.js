const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0x7983403dDA368AA7d67145a9b81c5c517F364c42",
        ],
        fetchCoValentTokens: true,
      }),
  },
};
