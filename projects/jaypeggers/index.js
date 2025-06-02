const { sumTokensExport } = require("../helper/unwrapLPs");
const coreAssets = require("../helper/coreAssets.json");

module.exports = {
  methodology: "Tracks funds locked in the Jay ERC20 contracts on Ethereum",
  ethereum: {
    tvl: sumTokensExport({
      owners: [
        "0xDA7C0810cE6F8329786160bb3d1734cf6661CA6E",
        "0x112E9FdAd728aDFBb1CE407a9CFa9339E1C6E130",
      ],
      tokens: [coreAssets.null],
    }),
  },
};
