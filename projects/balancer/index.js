const sdk = require('@defillama/sdk');
const BigNumber = require("bignumber.js");
const { toUSDTBalances } = require('../helper/balances');
const { GraphQLClient, gql } = require('graphql-request')

async function getTVL(subgraphName, block) {
  var endpoint = `https://api.thegraph.com/subgraphs/name/balancer-labs/${subgraphName}`
  var graphQLClient = new GraphQLClient(endpoint)

  var query = gql`
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
  const results = await graphQLClient.request(query, {
    block
  })
  return results.balancers[0].totalLiquidity;
}

async function ethereum(timestamp, ethBlock) {
  const [v1,v2] = await Promise.all([getTVL("balancer", ethBlock), getTVL("balancer-v2", ethBlock)])

  return toUSDTBalances(BigNumber(v1).plus(v2))
}

async function polygon(timestamp, ethBlock, chainBlocks) {
  return toUSDTBalances(await getTVL("balancer-polygon-v2", chainBlocks.polygon))
}

module.exports = {
  misrepresentedTokens: true,
  methodology: `Balancer TVL is pulled from the Balancer subgraph and includes deposits made to Balancer v1 and v2 liquidity pools.`,
  ethereum:{
    tvl: ethereum
  },
  polygon:{
    tvl: polygon
  },
  tvl: sdk.util.sumChainTvls([ethereum, polygon])
}
