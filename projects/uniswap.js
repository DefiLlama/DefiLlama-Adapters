const retry = require('async-retry')
const axios = require("axios");
const { GraphQLClient, gql } = require('graphql-request')

async function fetch() {

    var endpoint = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2'
    var graphQLClient = new GraphQLClient(endpoint)

    var query = gql`
    {
     uniswapFactory(id: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f"){
       totalVolumeUSD
       totalLiquidityUSD
       txCount
     }
    }
    `;
    const results = await retry(async bail => await graphQLClient.request(query))
    //console.log(results);
    return results.uniswapFactory.totalLiquidityUSD
}

module.exports = {
  fetch
}
