const { sumTokensExport } = require("../helper/chain/ton");
const ADDRESSES = require("../helper/coreAssets.json");

const BagelLpPool = "UQAqcydSR5paeZTvCSN5XwAuaHB1T5aE33rofhvpz0B59gKr"

module.exports = {
  methodology: 'Counts LP smartcontract balance as TVL.',
  ton: {
    tvl: sumTokensExport({ owners: [BagelLpPool], tokens: [ADDRESSES.null]}),
  }
}
