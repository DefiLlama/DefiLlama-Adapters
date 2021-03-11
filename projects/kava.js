const retry = require('async-retry')
const axios = require("axios");
const BigNumber = require("bignumber.js");


async function fetch() {
  let price_feed = await retry(async bail => await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ripple,hard-protocol,binancecoin,kava,bitcoin&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true'))

  let cdps = await retry(async bail => await axios.get('https://kava4.data.kava.io/cdp/cdps?limit=5000'))

  var tvl = 0;
  let bnbTotal = 0;
  let btcTotal = 0;
  let xrpTotal = 0;
  let kavaTotal = 0;
  let hardTotal = 0;

  await Promise.all(
    cdps.data.result.map(async cdp => {
      if (cdp.cdp.collateral.denom == 'bnb') {
        bnbTotal += parseFloat(cdp.cdp.collateral.amount);
      } else if (cdp.cdp.collateral.denom == 'busd') {
        let busd = parseFloat(cdp.cdp.collateral.amount);
        busd = new BigNumber(busd).div(10 ** 8).toFixed(2);
        tvl += parseFloat(busd)
      } else if (cdp.cdp.collateral.denom == 'btcb') {
        btcTotal += parseFloat(cdp.cdp.collateral.amount);
      } else if (cdp.cdp.collateral.denom == 'xrpb') {
        xrpTotal += parseFloat(cdp.cdp.collateral.amount);
      } else if (cdp.cdp.collateral.denom == 'ukava') {
        kavaTotal += parseFloat(cdp.cdp.collateral.amount);
      } else if (cdp.cdp.collateral.denom == 'hard') {
        hardTotal += parseFloat(cdp.cdp.collateral.amount);
      } else {

        console.log(cdp.cdp.collateral.denom);
      }
    })
  )
  let bnbAmount = new BigNumber(bnbTotal).div(10 ** 8).toFixed(2);
  tvl += (parseFloat(bnbAmount) * price_feed.data.binancecoin.usd)

  let btcAmount = new BigNumber(btcTotal).div(10 ** 8).toFixed(2);
  tvl += (parseFloat(btcAmount) * price_feed.data.bitcoin.usd)

  let xrpAmount = new BigNumber(xrpTotal).div(10 ** 8).toFixed(2);
  tvl += (parseFloat(xrpAmount) * price_feed.data.ripple.usd)

  let kavaAmount = new BigNumber(kavaTotal).div(10 ** 8).toFixed(2);
  tvl += (parseFloat(kavaAmount) * price_feed.data.kava.usd)

  let hardAmount = new BigNumber(hardTotal).div(10 ** 8).toFixed(2);
  tvl += (parseFloat(hardAmount) * price_feed.data['hard-protocol'].usd)

  return tvl;

}


module.exports = {
  fetch
}
