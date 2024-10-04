const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0x2658723bf70c7667de6b25f99fcce13a16d25d08",
          "0x26dB93F8b8b4f7016240af62F7730979d353f9A7",
        ],
        fetchCoValentTokens: true,
      }),
  },
};
