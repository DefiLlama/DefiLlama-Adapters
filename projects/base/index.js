const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0x3154Cf16ccdb4C6d922629664174b904d80F2C35",
          "0x49048044D57e1C92A77f79988d21Fa8fAF74E97e",
        ],
        fetchCoValentTokens: true,
      }),
  },
};
