const sdk = require('@defillama/sdk');
const { blockQuery } = require('../helper/graph')
const { toUSDTBalances } = require('../helper/balances');
const { gql } = require('graphql-request');

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

async function getChainTvl(chain, block) {
  const results = await blockQuery(endpoints[chain], query, block, 800)

  return toUSDTBalances(results.balancers[0].totalLiquidity);
}

async function bsc(timestamp, block, chainBlocks) {
  return getChainTvl('bsc', chainBlocks['bsc']);
}

async function polygon(timestamp, block, chainBlocks) {
  return getChainTvl('polygon', chainBlocks['polygon']);
}

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: bsc
  },
  polygon: {
    tvl: polygon
  },
}
