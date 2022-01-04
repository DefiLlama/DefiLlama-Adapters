const retry = require('../helper/retry')
const axios = require("axios");
const { GraphQLClient, gql } = require('graphql-request')

async function fetch() {

    var endpoint = 'https://api.thegraph.com/subgraphs/name/curiosthoth/nowswap'
    var graphQLClient = new GraphQLClient(endpoint)

    var query = gql`
    {
      nowswapFactories(first: 1) {
        totalLiquidityUSD
        totalLiquidityETH
      }
    }
    `;

    const results = await retry(async bail => await graphQLClient.request(query))
    return parseFloat(results.nowswapFactories[0].totalLiquidityUSD)
}

module.exports = {
  fetch
}
