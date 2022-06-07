const retry = require('async-retry');
const axios = require("axios");
const BigNumber = require("bignumber.js");

const APIs = {
  exinswap: 'https://app.exinswap.com/api/v1/statistic/total',
}

async function fetch() {
  const resp = await retry(async bail => await axios.get(APIs.exinswap))
  let result = new BigNumber(0);
  const tvl = resp.data.data.totalUsdtBalance;
  result = parseFloat(tvl);
  return result.toFixed(2);
}

module.exports = {
  fetch
}