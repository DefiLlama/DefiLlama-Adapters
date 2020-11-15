const retry = require('async-retry')
const axios = require("axios");
const { GraphQLClient, gql } = require('graphql-request')

async function fetch() {
  var endpoint ='https://api.thegraph.com/subgraphs/name/balancer-labs/balancer';
  var graphQLClient = new GraphQLClient(endpoint)

  var query = gql`
  {
    balancers(first: 5) {
      totalLiquidity,
      totalSwapVolume
    }
  }
  `;
  const results = await retry(async bail => await graphQLClient.request(query))
  return parseFloat(results.balancers[0].totalLiquidity);

}

module.exports = {
  fetch
}
