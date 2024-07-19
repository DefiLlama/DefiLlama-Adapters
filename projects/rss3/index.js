const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: sumTokensExport({
      owners: [
        "0x4cbab69108Aa72151EDa5A3c164eA86845f18438",
      ],
      fetchCoValentTokens: true,
    }),
  },
}
