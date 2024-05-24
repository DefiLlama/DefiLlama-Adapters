const { get } = require('../helper/http')
const BigNumber = require("bignumber.js");

const API = 'https://mtg-api.b.watch/api/etfs'

async function fetchBwatch() {
  const resp = await get(API)
  const etfs = resp.data.etfs;
  let sum = 0;
  for (let ix = 0; ix < etfs.length; ix++) {
    sum += etfs[ix].gems.reduce((acc, i)=>acc+i.price*i.balance, 0);
  }
  return sum;
}

async function fetch() {
  const ret = await fetchBwatch();
  return ret;
}

module.exports = {
  mixin: {
    fetch
  },
  fetch
}

