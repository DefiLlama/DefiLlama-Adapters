const { sumTokensExport } = require("../helper/chain/ton");
const ADDRESSES = require("../helper/coreAssets.json");

const tonStableAddr = "EQC2Bt4vwcSgCwABlOfgl75GbGuC0GpRU2GsZKqqMHu-T0gk";

module.exports = {
  methodology: "TonStable's TVL includes all deposited supported assets",
  ton: {
    tvl: sumTokensExport({ owner: tonStableAddr, tokens: [ADDRESSES.null] }),
  },
};
