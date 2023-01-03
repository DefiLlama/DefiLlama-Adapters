const { request } = require("graphql-request");
const { toUSDTBalances } = require('../helper/balances')

const LiquidityQuery = `
{
    factory {
      pairCount
      totalValueLockedUSD
    }
  }
`

const StakingQuery2 = `{
  totalValueLockedUSD
  totalValueStakedUSD
  totalLockedMexStakedUSD
}`

async function tvl() {
  const results = await request("https://graph.maiar.exchange/graphql", LiquidityQuery)

  return toUSDTBalances(results.factory.totalValueLockedUSD)
}

async function stakingAndLockedMEX() {
  const results = await request("https://graph.maiar.exchange/graphql", StakingQuery2)
  return toUSDTBalances(results.totalValueStakedUSD)
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  elrond: {
    tvl,
    staking: stakingAndLockedMEX,
  },
}