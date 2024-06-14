const { toUSDTBalances } = require("../helper/balances");
const { get } = require('../helper/http')

async function tvl() {
  const url = 'https://teiwz-pqaaa-aaaap-ag7hq-cai.raw.icp0.io/gold_nft_metrics';
  const data = await get(url);
  return toUSDTBalances(data.tvl);
}

module.exports = {
  timetravel: false,
  methodology: "TVL counts gold bar owned by gold dao and convert gram to usd price using Forex Public Data",
  icp: {
    tvl,
  },
}
