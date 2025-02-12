const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0x81014F44b0a345033bB2b3B21C7a1A308B35fEeA",
          "0x0bd48f6B86a26D3a217d0Fa6FfE2B491B956A7a2",
        ],
        fetchCoValentTokens: true,
      }),
  },
};
