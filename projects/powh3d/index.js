const { sumTokensExport } = require("../helper/unwrapLPs");
const coreAssets = require("../helper/coreAssets.json");
const P3D = "0xB3775fB83F7D12A36E0475aBdD1FCA35c091efBe";

module.exports = {
  methodology:
    "TVL includes a P3D farm contract",
  ethereum: {
    tvl: sumTokensExport({ owners: [P3D], tokens: [coreAssets.null] }),
  },
};
