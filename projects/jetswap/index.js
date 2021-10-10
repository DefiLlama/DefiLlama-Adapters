const sdk = require("@defillama/sdk");
const retry = require("async-retry");
const { GraphQLClient, gql } = require("graphql-request");
const { toUSDTBalances } = require("../helper/balances");

async function bscTvl() {
  var endpoint =
    "https://api.thegraph.com/subgraphs/name/smartcookie0501/jetswap-subgraph";
  var graphQLClient = new GraphQLClient(endpoint);

  var query = gql`
    {
      uniswapFactories(first: 5) {
        totalLiquidityUSD
      }
    }
  `;
  const results = await retry(
    async (bail) => await graphQLClient.request(query)
  );
  return toUSDTBalances(
    Number(results.uniswapFactories[0].totalLiquidityUSD)
  );
}

async function polygonTvl() {
  var endpoint =
    "https://api.thegraph.com/subgraphs/name/smartcookie0501/jetswap-subgraph-polygon";
  var graphQLClient = new GraphQLClient(endpoint);

  var query = gql`
    {
      uniswapFactories(first: 5) {
        totalLiquidityUSD
      }
    }
  `;
  const results = await retry(
    async (bail) => await graphQLClient.request(query)
  );
  return toUSDTBalances(
    Number(results.uniswapFactories[0].totalLiquidityUSD)
  );
}

async function fantomTvl() {
  var endpoint =
    "https://api.thegraph.com/subgraphs/name/smartcookie0501/jetswap-subgraph-fantom";
  var graphQLClient = new GraphQLClient(endpoint);

  var query = gql`
    {
      uniswapFactories(first: 5) {
        totalLiquidityUSD
      }
    }
  `;
  const results = await retry(
    async (bail) => await graphQLClient.request(query)
  );
  return toUSDTBalances(
    Number(results.uniswapFactories[0].totalLiquidityUSD)
  );
}

module.exports = {
  bsc: {
    tvl: bscTvl,
  },
  polygon: {
    tvl: polygonTvl,
  },
  fantom: {
    tvl: fantomTvl,
  },
  tvl: sdk.util.sumChainTvls([bscTvl, polygonTvl, fantomTvl]),
};
