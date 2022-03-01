const retry = require('async-retry')
const axios = require("axios");
const BigNumber = require("bignumber.js");

async function fetch() {
  const url = 'https://europe-west3-wormhole-315720.cloudfunctions.net/mainnet-notionaltvl'
  const res = await retry(async bail => await axios.get(url))
  const tvl = res.data.AllTime["*"]["*"].Notional
  return new BigNumber(tvl).toFixed(2)
}

module.exports = {
  fetch
}
