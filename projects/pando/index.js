const retry = require('async-retry');
const axios = require("axios");
const BigNumber = require("bignumber.js");

const APIs = {
  lake: 'https://mtgswap-api.fox.one/api/pairs',
  leaf: 'https://leaf-api.pando.im/api/cats',
  rings: 'https://rings-api.pando.im/api/v1/statistic/markets/all/overview',
}

async function fetchLake() {
  const resp = await retry(async bail => await axios.get(APIs.lake))
  const pairs = resp.data.data.pairs;
  let sum = new BigNumber(0);
  for (let ix = 0; ix < pairs.length; ix++) {
    const pair = pairs[ix];
    sum = sum.plus(pair.base_value).plus(pair.quote_value);
  }
  return sum.toFixed(2);
}

async function fetchLeaf() {
  const resp = await retry(async bail => await axios.get(APIs.leaf))
  const collaterals = resp.data.data.collaterals;
  let sum = new BigNumber(0);
  for (let ix = 0; ix < collaterals.length; ix++) {
    const collateral = collaterals[ix];
    const colSum = new BigNumber(collateral.ink);
    sum = sum.plus(colSum.times(collateral.price));
  }
  return sum.toFixed(2);
}

async function fetchRings() {
  const resp = await retry(async bail => await axios.get(APIs.rings))
  const data = resp.data;
  let sum = new BigNumber(data.total_supply);
  return sum.toFixed(2);
}

async function fetch() {
  const results = [];
  results.push(await fetchLake());
  results.push(await fetchLeaf());
  results.push(await fetchRings());
  return results.reduce((a, b) => {
    if (a.constructor === String) {
      a = new BigNumber(a);
    }
    return a.plus(b);
  }).toFixed(2);
}

module.exports = {
  fetch
}

