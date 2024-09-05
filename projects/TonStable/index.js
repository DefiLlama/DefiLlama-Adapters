const { sumTokensExport } = require("../helper/chain/ton");
const ADDRESSES = require("../helper/coreAssets.json");

const tonStableAddr = "EQDQ-x5TqoSiObbMqh28R1HzJwhrhiw6Oqhe9rT8DoKiRzlH";

module.exports = {
  methodology: "TonStable's TVL includes all deposited supported assets",
  ton: {
    tvl: sumTokensExport({ owner: tonStableAddr, tokens: [ADDRESSES.null] }),
  },
};
