const retry = require('async-retry');
const axios = require("axios");
const BigNumber = require("bignumber.js");
const { toUSDTBalances } = require('../helper/balances')

const APIs = {
  lake: 'https://mtgswap-api.fox.one/api/pairs',
}

async function tvl() {
  const resp = await retry(async bail => await axios.get(APIs.lake))
  const pairs = resp.data.data.pairs;
  let sum = new BigNumber(0);
  for (let ix = 0; ix < pairs.length; ix++) {
    const pair = pairs[ix];
    sum = sum.plus(pair.base_value).plus(pair.quote_value);
  }
  return toUSDTBalances(sum);
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  mixin: {
    tvl
  }
}

