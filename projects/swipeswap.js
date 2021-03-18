const retry = require('async-retry')
const axios = require("axios");
const { GraphQLClient, gql } = require('graphql-request')

async function fetch() {

    var endpoint = 'https://api.thegraph.com/subgraphs/name/swipewallet/exchange'
    var graphQLClient = new GraphQLClient(endpoint)

    var query = gql`
    {
     factory(id: "0x8a93B6865C4492fF17252219B87eA6920848EdC0"){
      volumeUSD
      liquidityUSD
      txCount
     }
    }
    `;
    const results = await retry(async bail => await graphQLClient.request(query))
    //console.log(results);
    return results.factory.liquidityUSD
}

module.exports = {
  fetch
}
