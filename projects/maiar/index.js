const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require('../helper/balances')
const { sumTokensExport } = require('../helper/sumTokens')

const LiquidityQuery = gql`
{
    factory {
      pairCount
      totalValueLockedUSD
    }
  }
`

async function tvl() {
  const results = await request("https://graph.maiar.exchange/graphql", LiquidityQuery)

  return toUSDTBalances(results.factory.totalValueLockedUSD)
}

const stakingContracts = [
  "erd1qqqqqqqqqqqqqpgq7qhsw8kffad85jtt79t9ym0a4ycvan9a2jps0zkpen",
  "erd1qqqqqqqqqqqqqpgqv4ks4nzn2cw96mm06lt7s2l3xfrsznmp2jpsszdry5"
]

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  elrond: {
    tvl,
    staking: sumTokensExport({ chain: 'elrond', owners: stakingContracts, token: 'MEX-455c57' })
  },
}