const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owner: "0x2a3DD3EB832aF982ec71669E178424b10Dca2EDe",
        fetchCoValentTokens: true,
      }),
  },
};
