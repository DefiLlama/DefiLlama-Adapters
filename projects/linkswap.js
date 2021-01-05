const retry = require('async-retry')
const { GraphQLClient, gql } = require('graphql-request')

async function fetch() {

    var endpoint = 'https://api.thegraph.com/subgraphs/name/yflink/linkswap-v1'
    var graphQLClient = new GraphQLClient(endpoint)

    var query = gql`
    {
     linkswapFactory(id: "0x696708Db871B77355d6C2bE7290B27CF0Bb9B24b"){
       totalVolumeUSD
       totalLiquidityUSD
       txCount
     }
    }
    `;
    const results = await retry(async bail => await graphQLClient.request(query))
    //console.log(results);
    return results.LinkswapFactory.totalLiquidityUSD
}

module.exports = {
  fetch
}
