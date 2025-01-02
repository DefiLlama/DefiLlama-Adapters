const { get } = require('../helper/http')
const BigNumber = require("bignumber.js");

const APIs = {
  exinpool: 'https://mixin.exinpool.com/api/v1/node/status',
}

async function fetch() {
  const resp = await get(APIs.exinpool)
  let result = new BigNumber(0);
  const tvl = resp.data.totalValueUsd;
  result = parseFloat(tvl);
  return result.toFixed(2);
}

module.exports = {
  mixin: {
    fetch
  },
  fetch
}
