const { GraphQLClient, gql } = require('graphql-request')

const PIPERX_GRAPHQL_URL = 'https://api.goldsky.com/api/public/project_clzxbl27v2ce101zr2s7sfo05/subgraphs/story-dex-swaps-mainnet/1.0.1/gn'

const graphQLClient = new GraphQLClient(PIPERX_GRAPHQL_URL)

const METRICS_QUERY = gql`
  query getDexMetrics {
    dex(id: "piperx") {
      tvlUSD
    }
  }
`

async function tvl(api) {
  const { dex } = await graphQLClient.request(METRICS_QUERY)
  
  // The value has 6 decimal places
  const tvlUSD = Number(dex.tvlUSD) / 1e6
  
  return {
    'usd': tvlUSD
  }
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "TVL is obtained by querying PiperX's subgraph which tracks all pools and their locked liquidity on Story Network.",
  story: {
    tvl,
  },
}
