const retry = require('async-retry')
const axios = require("axios");
const BigNumber = require("bignumber.js");

async function fetch() {
  // let shielded_coins = await retry(async bail => await axios.get('https://api.incscan.io/shielded-coins/overview'))
  // let tvl = new BigNumber(shielded_coins.data.currentAmount).toFixed(2);
  return 0;
}


module.exports = {
  fetch
}
