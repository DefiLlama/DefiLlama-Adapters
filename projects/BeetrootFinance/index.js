
const { fetchURL } = require('../helper/utils');
const ADDRESSES = require("../helper/coreAssets.json");

async function tvl(api) {
  const response = await fetchURL('https://api.beetroot.finance/v1/metrics');
  api.add(ADDRESSES.ton.USDT, response.data.tvl * 1e6);
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  methodology: `TVL calculation methodology consists of the delta between onchain USDT deposits and withdrawals`.trim(),
  ton: {
    tvl
  }
}