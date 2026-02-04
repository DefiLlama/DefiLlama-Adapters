const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0x4e259ee5f4136408908160dd32295a5031fa426f",
        ],
        fetchCoValentTokens: true,
      }),
  },
};
