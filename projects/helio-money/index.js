const retry = require('async-retry')
const axios = require("axios");
const BigNumber = require("bignumber.js");

async function fetch() {
  let price_feed = await retry(async bail => await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true'))
  let response = await retry(async bail => await axios.get('https://api.bscscan.com/api?module=stats&action=tokenCsupply&contractaddress=0x563282106A5B0538f8673c787B3A16D3Cc1DbF1a'))
  let tvl = new BigNumber(response.data.result).div(10 ** 18).toFixed(3);
  return (tvl * price_feed.data.binancecoin.usd);
}

module.exports = {
  fetch
}
