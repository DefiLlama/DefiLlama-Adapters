const { toUSDTBalances } = require("./helper/balances");
const { get } = require("./helper/http");

async function tvl() {
  const pools = await get('https://puzzle-js-back.herokuapp.com/api/v1/pools')
  const tvl = pools.reduce((acc, { statistics: { liquidity } = {} }) => acc + +(liquidity || 0), 0)

  return toUSDTBalances(tvl)
}

module.exports = {
  timetravel: false,
  waves: {
    tvl,
  }
};
