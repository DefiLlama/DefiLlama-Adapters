const { sumTokensExport } = require("../helper/chain/ton");
const ADDRESSES = require("../helper/coreAssets.json");

const addr = "EQBXZo11H4wUq3azWDphoUhlV710a-7rvUsqZUGLP9tUcf37"

module.exports = {
  methodology: 'Counts TON Hedge smartcontract balance as TVL.',
  ton: {
    tvl: sumTokensExport({ owner: addr, tokens: [ADDRESSES.ton.USDT] }),
  }
}
