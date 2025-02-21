const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0xBA61F25dd9f2d5f02D01B1C2c1c5F0B14c4B48A3",
          "0xeeCE9CD7Abd1CC84d9dfc7493e7e68079E47eA73",
        ],
        fetchCoValentTokens: true,
      }),
  },
};
