const { sumTokensExport } = require("../helper/unwrapLPs");
const ADDRESSES = require("../helper/coreAssets.json");

module.exports = {
  blast: {
    tvl: sumTokensExport({
      owner: "0x360CFF6ca6278954933A8556D1938B4cF3D747B5",
      tokens: [ADDRESSES.blast.USDB, ADDRESSES.blast.WETH],
    }),
  },
};
