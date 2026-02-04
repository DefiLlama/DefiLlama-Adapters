const { sumTokensExport } = require("../helper/unwrapLPs");
const coreAssets = require("../helper/coreAssets.json");

const etherFlipPool = "0xE5a04D98538231b0fAb9ABa60cd73cE4fF3039DF";

module.exports = {
  ethereum: {
    tvl: sumTokensExport({
      owners: [etherFlipPool],
      tokens: [coreAssets.null],
    }),
  },
};
