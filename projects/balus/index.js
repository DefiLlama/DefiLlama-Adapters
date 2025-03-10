const ADDRESSES = require("../helper/coreAssets.json")
const { sumTokensExport } = require("../helper/chain/ton")
const CONTRACT = "EQDswKn606G8kwS8RuUJg9baJbgAhixb6bYJC6VmIPU873uq"

module.exports = {
  methodology: "Counts all TON balance in the smart contract as the TVL",
  timetravel: false,
  ton: {
    tvl: sumTokensExport({
      owners: [CONTRACT],
      tokens: [ADDRESSES.ton.TON],
    })
  },
};
