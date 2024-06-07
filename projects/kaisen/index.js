const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  methodology: "TVL comes from the Vaults",
  blast: {
    tvl: sumTokensExport({
      owner: "0xd97cbc833643dc458849d5b96dea100f13b08402",
      resolveUniV3: true,
    }),
  },
};
