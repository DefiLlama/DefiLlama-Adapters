const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0xf530214106d443cde08a858e9c7e057048edb5a6",
        ],
        fetchCoValentTokens: true,
        permitFailure: true
      }),
  },
};
