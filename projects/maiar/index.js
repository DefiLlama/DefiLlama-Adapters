const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require('../helper/balances')
const { sumTokensExport, sumTokens } = require('../helper/sumTokens')

const LiquidityQuery = gql`
{
    factory {
      pairCount
      totalValueLockedUSD
    }
  }
`

const StakingQuery = gql`
{ 
  stakingFarms {address
    farmingToken {identifier}
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

async function staking() {
  const results = await request("https://graph.maiar.exchange/graphql", StakingQuery)
  const tokensAndOwners = stakingContracts.map(o => (['MEX-455c57', o]))
  results.stakingFarms.forEach(({ address, farmingToken: {identifier}}) => tokensAndOwners.push([identifier, address]))
  return sumTokens({ chain: 'elrond', tokensAndOwners, })
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  elrond: {
    tvl,
    // staking: sumTokensExport({ chain: 'elrond', owners: stakingContracts, token: 'MEX-455c57' })
    staking,
  },
}