const { get } = require('../helper/http')
const { toUSDTBalances } = require('../helper/balances');

async function tvl() {
  var response = await get('https://arufaresearch.pythonanywhere.com/tvl')
  return toUSDTBalances(response.tvl);
}

async function fetch_juno() {
  var response = await get('https://arufaresearch.pythonanywhere.com/juno_tvl')

  return toUSDTBalances(response.tvl);
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