const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require('../helper/balances')

const LiquidityQuery = gql`
{
    factory {
      pairCount
      totalValueLockedUSD
    }
  }
`

const StakeQuery = gql`
{
    factory {
      totalValueStakedUSD
    }
  }
`

async function tvl() {
  const results = await request("https://graph.maiar.exchange/graphql", LiquidityQuery)

  return toUSDTBalances(results.factory.totalValueLockedUSD)
}

async function tvs() {
  const results = await request("https://graph.maiar.exchange/graphql", StakeQuery)

  return toUSDTBalances(results.factory.totalValueStakedUSD)
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  elrond: {
    tvl,
    staking: tvs
  },
}
