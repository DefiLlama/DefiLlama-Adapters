// const { uniTvlExports } = require('../helper/unknownTokens')

// module.exports = uniTvlExports({
//   somnia: '0xaFd71143Fb155058e96527B07695D93223747ed1'
// })

const { request, gql } = require('graphql-request')
const { toUSDTBalances } = require('../helper/balances');

const endpoint = 'https://api.subgraph.somnia.network/api/public/962dcbf6-75ff-4e54-b778-6b5816c05e7d/subgraphs/somnia-swap/v1.0.0/gn'

const tvlQuery = gql`
query {
  pairFactory(id: "0") {
    totalLiquidityUSD
  }
  factories {
    totalValueLockedUSD
  }
}
`

async function tvl() {
  const data = await request(endpoint, tvlQuery)

  const factoryTvl  = parseFloat(data.pairFactory?.totalLiquidityUSD || 0)
  const factoriesTvl = parseFloat(data.factories?.[0]?.totalValueLockedUSD || 0)

  const total = factoryTvl + factoriesTvl

  return toUSDTBalances(total);
}

module.exports = {
  timetravel: false,
  methodology: 'TVL from subgraph totalLiquidityUSD + totalValueLockedUSD',
  somnia: { tvl }
}