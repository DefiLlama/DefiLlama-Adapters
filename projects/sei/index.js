const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: ["0x6f04B655d5209E85E47D3920A2EF407A66e83f6c"],
        fetchCoValentTokens: true,
      }),
  },
};

