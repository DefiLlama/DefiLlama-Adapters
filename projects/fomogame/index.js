const { sumTokensExport } = require("../helper/unwrapLPs");
const coreAssets = require("../helper/coreAssets.json");
const Fomo3D = [
  "0xba8be5277A06D2635553b331eAa0BCB6f4bDB809"
];

module.exports = {
  methodology: "TVL includes a Fomo3D farm contracts",
  matchain: {
    tvl: sumTokensExport({ owners: Fomo3D, tokens: [coreAssets.null] }),
  },
};
