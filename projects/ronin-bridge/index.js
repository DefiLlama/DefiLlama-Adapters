const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: sumTokensExport({
      owner: "0x64192819Ac13Ef72bF6b5AE239AC672B43a9AF08",
      fetchCoValentTokens: true,
    }),
  },
};
