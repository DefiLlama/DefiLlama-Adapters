const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0xAEB0c00D0125A8a788956ade4f4F12Ead9f65DDf",
          "0xa4cA04d02bfdC3A2DF56B9b6994520E69dF43F67",
        ],
        fetchCoValentTokens: true,
      }),
  },
};
