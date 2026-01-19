const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  bsc: {
    tvl: sumTokensExport({
      owners: ["0x0dd126ca9eaba5a9c55b14dd71787f88594a64d5"],
      tokens: [],
      fetchCoValentTokens: true,
    }),
  },
  tron: {
    tvl: sumTokensExport({
      owners: ["TLUvRRgLYMXxz4xAqg6c3FE5wy7tYZShgz"],
      tokens: [],
    }),
  },
  methodology: "TVL is calculated by summing the value of tokens held in Turbo USD protocol contracts.",
};
