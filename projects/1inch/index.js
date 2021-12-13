const retry = require('../helper/retry')
const { GraphQLClient, gql } = require('graphql-request')
const { endpoint } = require('./api')

async function fetch() {
  var graphQLClient = new GraphQLClient(endpoint)

  var query = gql`
    {
      mooniswapFactories(first: 1) {
        totalLiquidityUSD
        totalLiquidityETH
      }
    }
  `

  const results = await retry(async (bail) => await graphQLClient.request(query))
  return parseFloat(results.mooniswapFactories[0].totalLiquidityUSD)
}

module.exports = {
  fetch,
}
