const axios = require('axios');
const { toUSDTBalances } = require("../helper/balances");

async function tvl() {
  const url = 'https://teiwz-pqaaa-aaaap-ag7hq-cai.raw.icp0.io/gold_nft_metrics';

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data && data.tvl) {
      return toUSDTBalances(data.tvl);
    } else {
      return toUSDTBalances(0);
    }
  } catch (error) {
    return toUSDTBalances(0);
  }

}

module.exports = {
  timetravel: false,
  methodology: "TVL counts gold bar owned by gold dao and convert gram to usd price using Forex Public Data",
  icp: {
    tvl,
  },
};
