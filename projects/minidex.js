const retry = require('./helper/retry')
const { GraphQLClient, gql } = require('graphql-request')

async function fetch(timestamp, block) {
    var endpoint = 'https://api.thegraph.com/subgraphs/name/noberk/chapter3';
    var graphQLClient = new GraphQLClient(endpoint);

    var query = gql`
    query uniswapFactories {
        uniswapFactories(
            block: {number: ${block}}, 
            where: {id: "0x1E2C2102cf8EfCaAAf20fFe926469EC7cD0d0f6E"}
        ) {
            totalLiquidityUSD
        }}`;
    const results = await retry(
        async bail => await graphQLClient.request(query));
    return parseFloat(results.uniswapFactories[0].totalLiquidityUSD);
};

module.exports = {
  fetch
};