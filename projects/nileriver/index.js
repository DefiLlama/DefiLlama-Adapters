const axios = require('axios');
const retry = require('../helper/retry');
const { toUSDTBalances } = require('../helper/balances')

const tvlEndpoint = 'https://api.nileriver.finance/api/stats'

async function tvl() {
  const response = (
    await retry(async (bail) => await axios.get(tvlEndpoint))
  ).data.data;
  return toUSDTBalances(response.tvl)
}

module.exports = {
  timetravel: false,
  moonriver: { tvl }
};
