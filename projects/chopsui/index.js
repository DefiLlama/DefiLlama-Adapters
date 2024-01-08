const { dexExport } = require("../helper/chain/sui");

const suiExports = dexExport({
  account: "0xa25bc8482c0c6b17b9e5940da4e0d07773ffdb75ed187695c3827734350fa126",
  poolStr: "chopsui::LiquidityPools",
});

module.exports = suiExports;
