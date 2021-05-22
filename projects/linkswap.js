const retry = require('./helper/retry');
const { GraphQLClient, gql } = require('graphql-request');
const utils = require('./helper/utils');

async function fetch() {

    var endpoint = 'https://api.thegraph.com/subgraphs/name/yflink/linkswap-v1'
    var graphQLClient = new GraphQLClient(endpoint);

    var query = gql`
    {
     linkswapFactory(id: "0x696708Db871B77355d6C2bE7290B27CF0Bb9B24b"){
       totalVolumeUSD
       totalLiquidityUSD
       txCount
     }
     bundles {
       yflPrice
     }
    }
    `;
    const results = await retry(async bail => await graphQLClient.request(query))
    //console.log(results);
    var gov = '0x75D1aA733920b14fC74c9F6e6faB7ac1EcE8482E';
    var yfl = '0x28cb7e841ee97947a86B06fA4090C8451f64c0be';
    let balance = await utils.returnBalance(yfl, gov);
    let liquidity = results.linkswapFactory.totalLiquidityUSD;
    let governance = results.bundles[0].yflPrice * balance;
    let tvl = parseFloat(liquidity) + parseFloat(governance);
    return tvl;
}

module.exports = {
  fetch
}
