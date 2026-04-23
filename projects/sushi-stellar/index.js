const { post } = require('../helper/http')

const ENDPOINT = 'https://production.data-gcp.sushi.com/graphql'

const QUERY = `
  query {
    topPools(chainId: -4) {
      liquidityUSD
    }
  }
`

async function tvl(api) {
  const result = await post(
    ENDPOINT,
    { query: QUERY },
    {
      headers: { 'Content-Type': 'application/json' },
    },
  )

  if (result.errors) {
    throw new Error(
      `GraphQL errors: ${result.errors.map((e) => e.message).join(', ')}`,
    )
  }

  const pools = result.data?.topPools || []
  const totalTvl = pools.reduce(
    (sum, pool) => sum + (pool.liquidityUSD || 0),
    0,
  )

  api.addUSDValue(totalTvl)
}

module.exports = {
  timetravel: false,
  stellar: { tvl },
}
