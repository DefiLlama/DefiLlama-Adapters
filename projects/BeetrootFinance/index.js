
const { get } = require('../helper/http')
const ADDRESSES = require("../helper/coreAssets.json");

async function tvl(api) {
  const data = await get('https://api.beetroot.finance/v1/tvl')
  api.add(ADDRESSES.ton.USDT, data.tvl)
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  methodology: `TVL calculation methodology consists of the delta between onchain USDT deposits and withdrawals`.trim(),
  ton: {
    tvl
  }
}