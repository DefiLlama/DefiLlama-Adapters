const retry = require('async-retry')
const axios = require("axios");
const BigNumber = require("bignumber.js");
const { toUSDTBalances } = require("../helper/balances");

async function tvl(timestamp, block) {
  // Retrieve TVL Data
  const endpoint = 'https://api.flashstake.io/protocol/tvl/' + block;
  let response = await retry(async bail => await axios({
    method: "GET",
    url: endpoint,
    timeout: 30000, // at most only wait 30 seconds
  }));
  return toUSDTBalances(new BigNumber(response.data['totalTVL']));
}

module.exports = {
  misrepresentedTokens: false,
  ethereum: {
    tvl,
  },
  timetravel: true,
  start: 15450000
};
