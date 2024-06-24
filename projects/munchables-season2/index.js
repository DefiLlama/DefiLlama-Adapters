const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  blast: {
    tvl: sumTokensExport({
      owner: "0xEA091311Fc07139d753A6BBfcA27aB0224854Bae",
      tokens: [ADDRESSES.null, ADDRESSES.blast.USDB, ADDRESSES.blast.WETH],
    }),
  },
};