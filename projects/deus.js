const retry = require('./helper/retry')
const axios = require("axios")
const BigNumber = require("bignumber.js")

async function fetch() {
  var res = await retry(async bail => await axios.get('https://app.deus.finance/tvl.json'))
  var tvl_details = res.data
  var stakingLockedValue = await new BigNumber(tvl_details.stakingLockedValue)
  var uniswapLockedValue = await new BigNumber(tvl_details.uniswapLockedValue)
  var etherLockedInMarketMaker = await new BigNumber(tvl_details.etherLockedInMarketMaker)
  var tvl = new BigNumber(0)
  tvl = tvl.plus(stakingLockedValue).plus(uniswapLockedValue).plus(etherLockedInMarketMaker)
  return tvl.toNumber()
}

module.exports = {
  fetch
}
