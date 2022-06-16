const retry = require('async-retry')
const { GraphQLClient, gql } = require('graphql-request')

async function fetch() {
  var endpoint ='https://graph.sx.technology/subgraphs/name/sharkswap/exchange'
  var graphQLClient = new GraphQLClient(endpoint)

  var query = gql`
  {
    dayDatas(first: 1, orderBy: date, orderDirection: desc) {
      date
      liquidityUSD
    }
  }
  `
  
  const results = await retry(async bail => await graphQLClient.request(query))
  return results.dayDatas[0].liquidityUSD
}

module.exports = {
  fetch
}
