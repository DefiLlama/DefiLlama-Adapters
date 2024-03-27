const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  hallmarks: [
    [1711487351,"Protocol Exploited"]
  ],
  blast: {
    tvl: sumTokensExport({
      owner: "0x29958E8E4d8a9899CF1a0aba5883DBc7699a5E1F",
      tokens: [ADDRESSES.null, ADDRESSES.blast.USDB, ADDRESSES.blast.WETH],
    }),
  },
};
