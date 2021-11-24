const retry = require('./helper/retry')
const axios = require("axios");
const { GraphQLClient, gql } = require('graphql-request')
const { getBlock } = require('./helper/getBlock')

async function fetch(timestamp, ethBlock, chainBlocks) {
    var endpoint = 'https://graph.hswap.com/subgraphs/name/hswapprotocol/hswap';
    var graphQLClient = new GraphQLClient(endpoint);
    var block = await getBlock(timestamp, 'heco', chainBlocks);

    var query = gql`
    query hswapFactories {
        hswapFactories(
            block: {number: ${block}}, 
            where: {id: "0x13D1EA691C8153F5bc9a491d41b927E2baF8A6b1"}
        ) {
            totalLiquidityUSD
        }}`;

    const results = await retry(
        async bail => await graphQLClient.request(query));
    return parseFloat(results.hswapFactories[0].totalLiquidityUSD);
};

module.exports = {
  fetch
};