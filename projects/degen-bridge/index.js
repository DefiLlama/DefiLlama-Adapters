const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  base: {
    tvl: sumTokensExport({
      owner: "0xEfEf4558802bF373Ce3307189C79a9cAb0a4Cb9C",
      fetchCoValentTokens: true,
    }),
  },
};
