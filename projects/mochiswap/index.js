const sdk = require('@defillama/sdk');
const { toUSDTBalances } = require('../helper/balances');
const { GraphQLClient, gql } = require('graphql-request');

const endpoints = {
  bsc: 'https://api.thegraph.com/subgraphs/name/mochiswapdev/mochiswap3',
  harmony: 'https://api.mochiswap.io/subgraphs/name/mochiswap/mochiswap1',
}

const graphQuery = gql`
query get_tvl($block: Int) {
  uniswapFactories(
    first: 1,
    block: { number: $block }
  ) {
    totalLiquidityUSD
  },
}
`;

async function getChainTvl(chain, block) {
  const graphQLClient = new GraphQLClient(endpoints[chain]);
  const results = await graphQLClient.request(query, { block });

  return toUSDTBalances(results.uniswapFactory[0].totalLiquidityUSD);
}

async function bsc(timestamp, block, chainBlocks) {
  return getChainTvl('bsc', chainBlocks['bsc']);
}

async function harmony(timestamp, block, chainBlocks) {
  return getChainTvl('harmony', chainBlocks['harmony']);
}

module.exports = {
  bsc: {
    tvl: bsc
  },
  harmony: {
    tvl: harmony
  },
  tvl: sdk.util.sumChainTvls([harmony, bsc])
}
