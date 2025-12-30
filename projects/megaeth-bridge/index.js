const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0x7f82f57F0Dd546519324392e408b01fcC7D709e8",
        ],
        fetchCoValentTokens: true,
        permitFailure: true
      }),
  },
};
