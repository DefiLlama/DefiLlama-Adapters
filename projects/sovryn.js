const retry = require('async-retry')
const axios = require("axios");
const BigNumber = require("bignumber.js");
async function fetch() {
  let tvl_feed = await retry(async bail => await axios.get('https://backend.sovryn.app/tvl'))
  let tvl = new BigNumber(tvl_feed.data.total_usd).toFixed(2);
  return tvl;
}
module.exports = {
  fetch
}
