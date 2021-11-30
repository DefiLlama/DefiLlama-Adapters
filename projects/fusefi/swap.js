const axios = require("axios");
const sdk = require('@defillama/sdk');
const { GraphQLClient, gql } = require('graphql-request');
const retry = require('../helper/retry');
const endpoint = 'https://api.thegraph.com/subgraphs/name/fuseio/fuseswap';

async function fetch() {
    var graphQLClient = new GraphQLClient(endpoint)
    var query = gql`{
        uniswapFactories {
            totalLiquidityUSD
        }
    }`;

    const results = await retry(
        async bail => await graphQLClient.request(query));
    return parseFloat(results.uniswapFactories[0].totalLiquidityUSD);
};



module.exports={
    
    fetch,
    
}


