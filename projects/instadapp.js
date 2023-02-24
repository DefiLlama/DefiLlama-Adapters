const {toUSDTBalances} = require('./helper/balances')
const { get } = require('./helper/http')

async function fetch() {
  const stats = (
    await get(
      "https://api.internal.instadapp.io/defi/api/stats/instadapp/overall?limit=1&offset=0"
      )
  ).stats[0];

  return toUSDTBalances(stats.totalSupplied);
}

module.exports = {
  misrepresentedTokens: true,
  doublecounted: true,
  timetravel: false,
  ethereum: {
    tvl: fetch,
  },
  
}
// node test.js projects/instadapp.js