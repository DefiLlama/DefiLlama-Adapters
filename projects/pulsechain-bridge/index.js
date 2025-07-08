const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: sumTokensExport({
      owner: "0x1715a3E4A142d8b698131108995174F37aEBA10D",
      fetchCoValentTokens: true,
    }),
  },
};
