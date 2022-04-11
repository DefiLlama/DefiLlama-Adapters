const retry = require("./helper/retry");
const axios = require("axios");
const {toUSDTBalances} = require('./helper/balances')

async function fetch() {
  const stats = (
    await retry(async (bail) => await axios.get(
      "https://api.internal.instadapp.io/defi/api/stats/instadapp/overall?limit=1&offset=0"
      )
    )
  ).data.stats[0];

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