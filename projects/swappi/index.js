const retry = require('async-retry');
const { GraphQLClient, gql } = require('graphql-request');
const { toUSDTBalances } = require('../helper/balances');

const endpoint = "https://graphql.swappi.io/subgraphs/name/swappi-dex/swappi";

const query = gql`
  query MyQuery {
    uniswapFactories {
      totalLiquidityUSD
    }
  }
`;

const graphQLClient = new GraphQLClient(endpoint);


async function fetch() {
    const results = await retry(async bail => await graphQLClient.request(query));
    const tvlAmount = parseFloat(results.uniswapFactories[0].totalLiquidityUSD);
  return toUSDTBalances(tvlAmount)
}

module.exports = {
  misrepresentedTokens: true,
  conflux: {
    tvl: fetch,
  }
  
} 