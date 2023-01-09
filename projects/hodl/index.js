const { get } = require('../helper/http')
const BigNumber = require("bignumber.js");

const APIs = {
  pools: 'https://hodl-api.fox.one/api/pools',
}

async function fetch() {
  const resp = await get(APIs.pools)
  const pools = resp.data.pools;
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
  mixin: {
    fetch
  },
  fetch
}
