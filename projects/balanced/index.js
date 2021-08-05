const retry = require("async-retry");
const axios = require("axios");
const BigNumber = require("bignumber.js");

async function fetch() {
  let response = await retry(async _bail => await axios.get("https://balanced.geometry.io/api/v1/stats/total-value-locked"));
  let tvl = new BigNumber(response.data.total_value_locked_usd).div(10 ** 18).toFixed(2);
  return (tvl);
}

module.exports = {
  fetch
}