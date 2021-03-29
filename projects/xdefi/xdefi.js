const retry = require('async-retry')
const axios = require("axios");
const { GraphQLClient, gql } = require('graphql-request')

async function fetch() {
    var xdexApi = 'https://api.thegraph.com/subgraphs/name/xdefilab/xdefidex';
    var xdexGraphQLClient = new GraphQLClient(xdexApi)
    var xdexQuery = gql`
    {
        xdefi(first: 1) {
            id,
            version,
            totalLiquidity,
            totalSwapVolume
        }
    }
  `;
    var results = await retry(async bail => await xdexGraphQLClient.request(xdexQuery))
    const xdexTotalLiquidity = parseFloat(results.xdefi[0].totalLiquidity);

    var xhalflifeApi = 'https://api.thegraph.com/subgraphs/name/xdefilab/xhalflife';
    var xhalflifeGraphQLClient = new GraphQLClient(xhalflifeApi)
    var xhalflifeQuery = gql`
    {
    streamTotalDatas(first: 100, orderBy: locked, orderDirection:desc) {
            id
            token
            {
                id
                symbol
                decimals
            }
            count
            locked
            withdrawed
        }
     }
    `;
    results = await retry(async bail => await xhalflifeGraphQLClient.request(xhalflifeQuery))
    var xhalflifeTotalLiquidity = 0

    //query per token's prices

    //xhalflifeTotalLiquidity += per token's liquidity

    //return xdexTotalLiquidity + xhalflifeTotalLiquidity
}

module.exports = {
    fetch
}
