const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0xF5C9F957705bea56a7e806943f98F7777B995826",
        ],
        fetchCoValentTokens: true,
      }),
  },
};
