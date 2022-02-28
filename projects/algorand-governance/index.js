const retry = require('async-retry')
const axios = require("axios");
const BigNumber = require("bignumber.js");

async function fetch() {
  let price_endpoint = 'https://api.coingecko.com/api/v3/simple/price?ids=algorand&vs_currencies=usd'
  let governance_endpoint ='https://governance.algorand.foundation/api/periods/active/';

  let price_feed = await retry(async bail => await axios.get(price_endpoint))
  let response = await retry(async bail => await axios.get(governance_endpoint))

  let tvl = new BigNumber(response.data.total_committed_stake).div(10 ** 6).toFixed(2);

  return (tvl * price_feed.data.algorand.usd);
}


module.exports = {
  fetch
}