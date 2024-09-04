const { sumTokensExport } = require("../helper/chain/ton");
const ADDRESSES = require("../helper/coreAssets.json");

const tonStableAddr = "";

module.exports = {
  methodology: "TonStable's TVL includes all deposited supported assets",
  ton: {
    tvl: sumTokensExport({ owner: tonStableAddr, tokens: [ADDRESSES.null] }),
  },
};
