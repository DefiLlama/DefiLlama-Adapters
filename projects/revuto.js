const retry = require('async-retry');
const axios = require("axios");
const { toUSDTBalances } = require("./helper/balances");

async function staking() {
  const url = 'https://production-testing.revuto.com/api/v1/wallet/total_revu_staked_usd';
  return toUSDTBalances((await retry(async bail => await axios.get(url))).data);
};

module.exports = {
    timetravel: false,
    misrepresentedTokens: true,
    cardano: {
        tvl: () => ({}),
        staking
    }
};