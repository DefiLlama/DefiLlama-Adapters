const axios = require('axios');
const retry = require('../helper/retry');

async function tvl() {
  const response = (
    await retry(
      async () => await axios.get(
        'http://mainnet.collector.xbacked.io:4001/api/v1/getTVL'
      )
    )
  )
  const data = response.data
  return parseFloat(data);
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "Sums the total locked collateral value in usd across all vaults.",
  algorand: {
    tvl
  }
}
