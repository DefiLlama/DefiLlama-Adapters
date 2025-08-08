const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0xe07eA0436100918F157DF35D01dCE5c11b16D1F1",
          "0x91493a61ab83b62943E6dCAa5475Dd330704Cc84",
        ],
        fetchCoValentTokens: true,
      }),
  },
};
