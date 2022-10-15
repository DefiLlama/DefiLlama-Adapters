const {
  GraphQLClient,
  gql
} = require('graphql-request')

async function fetch() {

  var endpoint = 'https://api.apex.exchange/g2/subgraphs/name/apex/exchange'
  var graphQLClient = new GraphQLClient(endpoint)

  var query = gql `
    {
      dexFactories{
        totalLiquidityUSD
      }
    }
    `;

  const results = await graphQLClient.request(query)
  return parseFloat(results.dexFactories[0].totalLiquidityUSD)
}

module.exports = {
  fetch
}