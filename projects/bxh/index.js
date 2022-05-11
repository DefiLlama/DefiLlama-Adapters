const { toUSDTBalances } = require('../helper/balances');
const { GraphQLClient, gql } = require('graphql-request');

async function tvl(timestamp) {
  const query = gql`
    query {
        uniswapDayDatas(
          first: 10, 
          where: {
            date_gt: ${timestamp - 86400}
            date_lt: ${timestamp}
          }, 
          orderBy: date, 
          orderDirection: asc
          ) {
            totalLiquidityUSD
          }
        }`;
  const graphQLClient = new GraphQLClient("https://n10.hg.network/subgraphs/name/bxhinfov2/heco");
  const results = await graphQLClient.request(query);

  return toUSDTBalances(results.uniswapDayDatas[0].totalLiquidityUSD);
}

module.exports = {
    heco: {
        tvl,
    },
}; // node test.js projects/bxh/index.js
