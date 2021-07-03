
const sdk = require('@defillama/sdk');
const { toUSDTBalances } = require('../helper/balances');
const { GraphQLClient, gql } = require('graphql-request');

const endpoints = {
    eth: 'https://api.thegraph.com/subgraphs/name/dynamic-amm/dynamic-amm',
    polygon: 'https://api.thegraph.com/subgraphs/name/piavgh/dmm-exchange-matic',
  }

const query = gql`
query get_tvl($block: Int) {
    dmmFactory(
      first: 5,
      block: { number: $block }
    ) {
      totalLiquidityUSD
    }
  }
`;

async function getChainTvl(chain, block) {
  const graphQLClient = new GraphQLClient(endpoints[chain]);
  const results = await graphQLClient.request(query, { block });

  return toUSDTBalances(results.dmmFactory[0].totalLiquidity);
}

async function eth(timestamp, block, chainBlocks) {
  return getChainTvl('eth', chainBlocks['eth']);
}

async function polygon(timestamp, block, chainBlocks) {
  return getChainTvl('polygon', chainBlocks['polygon']);
}

module.exports = {
  ethererum: {
    tvl: eth
  },
  polygon: {
    tvl: polygon
  },
  tvl: sdk.util.sumChainTvls([polygon, eth])
}
