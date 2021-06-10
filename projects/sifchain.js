const axios = require('axios')
const retry = require('async-retry')
const BigNumber = require('bignumber.js')

async function fetch() {
  const priceFeed = await retry(async bail =>
    await axios('https://api.coingecko.com/api/v3/simple/price?ids=sifchain&vs_currencies=usd'))
  const getPoolsRes = await retry(async bail => 
    await axios('https://api.sifchain.finance/clp/getPools'))

  const tvl = getPoolsRes.data.result.Pools
    .map(pool => BigNumber(pool.native_asset_balance))
    .reduce((sum, current) => sum.plus(current))
    .multipliedBy(2)
    .dividedBy(10 ** 18)
    .multipliedBy(priceFeed.data.sifchain.usd)
    .toFixed(2)

    return Number(tvl)
}

module.exports = {
  fetch
}
