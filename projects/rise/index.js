const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0xad92Fa18EB74E46Db844240623124BF46589db4C",
        ],
        fetchCoValentTokens: true,
      }),
  },
};
