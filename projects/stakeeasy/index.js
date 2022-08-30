const retry = require('../helper/retry')
const axios = require("axios");
const { toUSDTBalances } = require('../helper/balances');

async function tvl() {
  var response = await retry(async bail => await axios.get('https://arufaresearch.pythonanywhere.com/tvl'))
  return toUSDTBalances(response.data.tvl);
}

async function fetch_juno() {
  var response = await retry(async bail => await axios.get('https://arufaresearch.pythonanywhere.com/juno_tvl'))

  return toUSDTBalances(response.data.tvl);
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  secret: {
    tvl
  },
  juno: {
    tvl: fetch_juno
  }
}