const retry = require('async-retry')
const { GraphQLClient, gql } = require('graphql-request')

async function tvl() {
  var endpoint ='https://d1oejh0y3ae31s.cloudfront.net/graphql';
  var graphQLClient = new GraphQLClient(endpoint)

  var query = gql`
  {
    getTVL {
        borrowerVolume,
        lenderVolume
    }
  }
  `;
  const results = await retry(async bail => await graphQLClient.request(query))
  const borrowerVolume = parseFloat(results.getTVL[0].borrowerVolume)
  const lendingVolume = parseFloat(results.getTVL[0].lenderVolume)

  const tvl = borrowerVolume + lendingVolume 

  return tvl
      
}

module.exports = {
  tvl
}