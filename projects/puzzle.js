const retry = require('async-retry');
const axios = require("axios");
const { toUSDTBalances } = require("./helper/balances");

async function tvl(timestamp) {
    const lockedAssets = (await retry(async bail => 
        await axios.get(`http://51.158.191.108:8002/api/v1/history/puzzle?since=${(timestamp - 6000) * 1000}`)
    )).data;
    const current = lockedAssets.pop();

    return toUSDTBalances(current.totalLocked);
};

module.exports = {
  timetravel: false,
  waves: {
    tvl,
  }
};