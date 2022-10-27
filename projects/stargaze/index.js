const retry = require('async-retry')
const axios = require("axios");
const BigNumber = require("bignumber.js");

async function fetch() {
  var price_feed = await retry(async bail => await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=stargaze&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true'))

  // Fetch staked quantities from the respective api's
  var stars = await retry(async bail => await axios.get('https://rest.stargaze-apis.com/cosmos/staking/v1beta1/pool'))
  var p_osmo = await retry(async bail => await axios.get('https://api.osmosis.zone/pools/v2/604'))
  var p_atom = await retry(async bail => await axios.get('https://api.osmosis.zone/pools/v2/611'))
  var p_ststars = await retry(async bail => await axios.get('https://api.osmosis.zone/pools/v2/810'))
  // Sum all bonded quantities
  var tvl = await new BigNumber(((parseFloat(stars.data.bonded_tokens) / parseFloat(10 ** 6)).toFixed(2)) + parseFloat(p_osmo.data.symbol.amount) + parseFloat(p_atom.data.symbol.amount) + parseFloat(p_ststars.data.symbol.amount));
  tvl = tvl * price_feed.data.stargaze.usd;
  return tvl;
}

module.exports = {
  fetch
}