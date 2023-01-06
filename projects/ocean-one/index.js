const { get } = require('../helper/http')
const BigNumber = require("bignumber.js");

const APIs = {
  oceanone: 'https://events.ocean.one/assets',
}

async function fetch() {
  const resp = await get(APIs.oceanone)
  const assets = resp.data;
  let result = new BigNumber(0);
  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    const total = new BigNumber(asset.balance).times(asset.price_usd)
    result = result.plus(total);
  }
  return result.toFixed(2);
}

module.exports = {
  mixin: {
    fetch
  },
  fetch
}