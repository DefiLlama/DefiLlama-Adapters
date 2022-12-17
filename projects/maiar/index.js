const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require('../helper/balances')

const LiquidityQuery = gql`
{
    totalValueLockedUSD
  }
`

const StakeQuery = gql`
{
    totalValueStakedUSD
  }
`

async function tvl() {
  const results = await request("https://graph.maiar.exchange/graphql", LiquidityQuery)

  return toUSDTBalances(results.totalValueLockedUSD)
}

async function tvs() {
  const results = await request("https://graph.maiar.exchange/graphql", StakeQuery)

  return toUSDTBalances(results.totalValueStakedUSD)
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  elrond: {
    tvl,
    staking: tvs
  },
}
