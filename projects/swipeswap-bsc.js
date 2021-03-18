const retry = require('async-retry')
const axios = require("axios");
const { GraphQLClient, gql } = require('graphql-request')

async function fetch() {

  var endpoint = 'https://api.bscgraph.org/subgraphs/id/QmdWgpk8reg9ZfjUQZqpmApANMQWPRLYUX2wweDRjghQGb'
    var graphQLClient = new GraphQLClient(endpoint)

    var query = gql`
    {
     factory(id: "0x7810d4b7bc4f7faee9deec3242238a39c4f1197d"){
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
