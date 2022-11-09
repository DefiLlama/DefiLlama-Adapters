const retry = require('async-retry');
const axios = require("axios");
const BigNumber = require("bignumber.js");

const APIs = {
  pools: 'https://hodl-api.fox.one/api/pools',
}

async function fetch() {
  const resp = await retry(async bail => await axios.get(APIs.pools))
  const pools = resp.data.data.pools;
  let sum = new BigNumber(0);
  for (let ix = 0; ix < pools.length; ix++) {
    const pool = pools[ix];
    const amount = BigNumber(pool.amount);
    const price = BigNumber(pool.price);
    sum = amount.times(price).plus(sum);
  }
  return sum.toFixed(2);
}

module.exports = {
  fetch
}
