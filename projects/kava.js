const retry = require('async-retry')
const axios = require("axios");
const BigNumber = require("bignumber.js");


async function fetch() {
  let price_feed = await retry(async bail => await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true'))

  let cdps = await retry(async bail => await axios.get('https://kava4.data.kava.io/cdp/cdps?limit=1000'))

  var bnbTotal = 0;
  await Promise.all(
    cdps.data.result.map(async cdp => {
      bnbTotal += parseFloat(cdp.cdp.collateral.amount);
    })
  )

  var bnbAmount = new BigNumber(bnbTotal).div(10 ** 8).toFixed(2);
  return bnbAmount * price_feed.data.binancecoin.usd

}


module.exports = {
  fetch
}
