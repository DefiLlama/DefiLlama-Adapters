const retry = require('async-retry')
const axios = require("axios");
const BigNumber = require("bignumber.js");

async function fetch() {
  let price_feed = await retry(async bail => await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=fantom&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true'))
  let response = await retry(async bail => await axios.get('https://api.etherscan.io/api?module=stats&action=tokensupply&contractaddress=0x4e15361fd6b4bb609fa63c81a2be19d873717870&apikey=H6NGIGG7N74TUH8K2X31J1KB65HFBH2E82'))
  let tvl = new BigNumber(response.data.result).div(10 ** 8).toFixed(2);
  return (tvl * price_feed.data.bitcoin.usd);
}

module.exports = {
  fetch
}
