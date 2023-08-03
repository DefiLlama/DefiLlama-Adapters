const BigNumber = require("bignumber.js");
const { get } = require('../helper/http')

const APIs = {
  exinswap: 'https://app.exinswap.com/api/v1/statistic/total',
}

async function fetch() {
  const resp = await get(APIs.exinswap)
  let result = new BigNumber(0);
  const tvl = resp.data.totalUsdtBalance;
  result = parseFloat(tvl);
  return result.toFixed(2);
}

module.exports = {
  mixin: {
    fetch
  },
  fetch
}