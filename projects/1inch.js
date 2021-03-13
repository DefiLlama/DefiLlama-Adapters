const retry = require('async-retry')
const axios = require("axios");
const { GraphQLClient, gql } = require('graphql-request')

async function fetch() {

    var endpoint = 'https://api.thegraph.com/subgraphs/name/1inch-exchange/oneinch-liquidity-protocol-v2'
    var graphQLClient = new GraphQLClient(endpoint)

    var query = gql`
    {
      mooniswapFactories(first: 1) {
        totalLiquidityUSD
        totalLiquidityETH
      }
    }
    `;

    const results = await retry(async bail => await graphQLClient.request(query))
    return parseFloat(results.mooniswapFactories[0].totalLiquidityUSD)
}

module.exports = {
  fetch
}
