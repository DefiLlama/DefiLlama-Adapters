const retry = require("./helper/retry");
const axios = require("axios");
const BigNumber = require("bignumber.js");

async function fetch() {
  // let shielded_coins = await retry(async bail => await axios.get('https://api.incscan.io/shielded-coins/overview'))
  // let tvl = new BigNumber(shielded_coins.data.currentAmount).toFixed(2);
  let tvl = "1";
  return tvl;
}

module.exports = {
  fetch,
};
