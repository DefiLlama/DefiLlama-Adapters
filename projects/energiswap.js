const { GraphQLClient, gql } = require('graphql-request')

async function fetch() {
  const endpoint = 'https://graphnode.energiswap.exchange:8000/subgraphs/name/energi/energiswap'
  const graphQLClient = new GraphQLClient(endpoint)

  const query = gql`
    query Energiswap_TVL {
      energiswapFactories(first: 1) {
        totalLiquidityUSD
      }
    }`

  const data = await graphQLClient.request(query)

  return data.energiswapFactories[0].totalLiquidityUSD
}

module.exports = {
  fetch
}
