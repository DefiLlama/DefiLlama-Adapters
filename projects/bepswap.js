const retry = require('./helper/retry')
const axios = require("axios");
const BigNumber = require("bignumber.js");


async function fetch() {
  return 0
  var price_feed = await retry(async bail => await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=thorchain&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true'))

  var res = await retry(async bail => await axios.get('https://chaosnet-midgard.bepswap.com/v1/network'))
  var tvl = await new BigNumber((parseFloat(res.data.totalStaked) * 2) + parseFloat(res.data.bondMetrics.totalActiveBond) + parseFloat(res.data.bondMetrics.totalStandbyBond)).div(10 ** 8).toFixed(2);
  tvl = tvl * price_feed.data.thorchain.usd;
  return tvl;

}


module.exports = {
  fetch
}