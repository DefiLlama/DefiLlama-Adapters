const retry = require('async-retry')
const axios = require("axios");
const BigNumber = require("bignumber.js");
const { toUSDTBalances } = require('../helper/balances');

async function fetchLiquidity() {
  const tvl = await retry(async bail => await axios.get('https://bbs5kn3x0j.execute-api.ap-southeast-1.amazonaws.com/dev/klay/ksInfo/tvl'))

  return toUSDTBalances(tvl.data)
}

module.exports = {
  klaytn: {
    tvl: fetchLiquidity,
  },
  timetravel: false,
}
