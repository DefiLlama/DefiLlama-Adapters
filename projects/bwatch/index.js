const retry = require('async-retry');
const axios = require("axios");
const BigNumber = require("bignumber.js");

const API = 'https://mtg-api.b.watch/api/etfs'

async function fetchBwatch() {
  const resp = await retry(async bail => await axios.get(API))
  const etfs = resp.data.data.etfs;
  let sum = new BigNumber(0);
  for (let ix = 0; ix < etfs.length; ix++) {
    const etf = etfs[ix];
    sum = sum.plus(new BigNumber(etf.circulating_supply).times(etf.price))
  }
  return sum.toFixed(2);
}

async function fetch() {
  const ret = await fetchBwatch();
  return ret;
}

module.exports = {
  fetch
}

