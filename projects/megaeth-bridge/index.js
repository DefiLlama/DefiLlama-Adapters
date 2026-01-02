const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0x7f82f57F0Dd546519324392e408b01fcC7D709e8",
          "0x0ca3a2fbc3d770b578223fbb6b062fa875a2ee75",
        ],
        fetchCoValentTokens: true,
        permitFailure: true
      }),
  },
};
