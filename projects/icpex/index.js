
const { get } = require('../helper/http')
const { toUSDTBalances } = require('../helper/balances')
const { PromisePool } = require('@supercharge/promise-pool')

module.exports = {
  misrepresentedTokens: true,
  icp: { tvl },
}

async function tvl() {
  let tvl = await get('https://mertics.icpex.org/api/tvl')
  return toUSDTBalances(tvl)
}