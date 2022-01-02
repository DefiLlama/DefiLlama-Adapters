const retry = require('async-retry')
const axios = require("axios");
const BigNumber = require("bignumber.js");

async function fetch() {
  let price_feed = await retry(async bail => await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=chikn-egg&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true'))
  let response = await retry(async bail => await axios.get('https://cdn-b.chikn.farm/api/feed/staked'))
  let tvl = new BigNumber(response.data.totalStakedAmount).toFixed(2);
  return (tvl * price_feed.data['chikn-egg'].usd);
}

module.exports = {
  fetch
}