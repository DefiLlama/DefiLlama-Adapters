const sdk = require('@defillama/sdk');
const { toUSDTBalances } = require('../helper/balances');
const { GraphQLClient, gql } = require('graphql-request');

const endpoints = {
  bsc: 'https://api.thegraph.com/subgraphs/name/yogi-fi/bsc',
  polygon: 'https://api.thegraph.com/subgraphs/name/yogi-fi/polygon',
}

const query = gql`
query get_tvl($block: Int) {
    balancers(
      first: 5,
      block: { number: $block }
    ) {
      totalLiquidity,
      totalSwapVolume
    }
  }
`;

async function getChainTvl(timestamp, chain) {
  const { block } = await sdk.api.util.lookupBlock(timestamp, { chain });

  const graphQLClient = new GraphQLClient(endpoints[chain]);
  const results = await graphQLClient.request(query, { block });

  return toUSDTBalances(results.balancers[0].totalLiquidity);
}

async function bsc(timestamp, block, chainBlocks) {
  return getChainTvl(timestamp, 'bsc');
}

async function polygon(timestamp, block, chainBlocks) {
  return getChainTvl(timestamp, 'polygon');
}

function mergeBalances(balances, balancesToMerge) {
  Object.entries(balancesToMerge).forEach(balance => {
    sdk.util.sumSingleBalance(balances, balance[0], balance[1])
  })
}

async function tvl(timestamp) {
  const balances = {}
  await Promise.all([
      // bsc(timestamp),
      polygon(timestamp),
  ]).then(poolBalances => poolBalances.forEach(pool => mergeBalances(balances, pool)))
  return balances
}

module.exports = {
  // bsc: {
  //   tvl: bsc
  // },
  polygon: {
    tvl: polygon
  },
  tvl
}
