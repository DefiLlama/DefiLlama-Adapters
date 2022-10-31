const retry = require('async-retry')
const axios = require("axios");
const BigNumber = require("bignumber.js");
  /*
  Currently bids are considered liquid because they can be canceled at anytime
  Pool bonds that are locked/bonded are not to be considered with TVL
  */
async function fetch() {
  var price_feed = await retry(async bail => await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=stargaze&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true'))

  // Fetch staked quantities from the respective api's
  var stars = await retry(async bail => await axios.get('https://rest.stargaze-apis.com/cosmos/staking/v1beta1/pool'))
  
  // Sum all bonded quantities
  var tvl = await new BigNumber(parseFloat(stars.data.bonded_tokens / (10 ** 6)));
  tvl = tvl * price_feed.data.stargaze.usd;
  return tvl;
}

module.exports = {
  fetch
}