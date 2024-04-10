const { sumTokensExport } = require("../helper/unwrapLPs");
const coreAssets = require("../helper/coreAssets.json");
const Fomo3D = [
  "0x4e8ecF79AdE5e2C49B9e30D795517A81e0Bf00B8",
  "0xA62142888ABa8370742bE823c1782D17A0389Da1",
];

module.exports = {
  methodology: "TVL includes a Fomo3D farm contracts",
  ethereum: {
    tvl: sumTokensExport({ owners: Fomo3D, tokens: [coreAssets.null] }),
  },
};
