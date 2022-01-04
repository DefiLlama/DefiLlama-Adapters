const sdk = require('@defillama/sdk');
const BigNumber = require("bignumber.js");
const { GraphQLClient, gql } = require('graphql-request')
const { toUSDTBalances } = require('../helper/balances');
const { getBlock } = require('../helper/getBlock');

async function getTVL(subgraphName, block) {
  var endpoint = `https://api.thegraph.com/subgraphs/name/centfinance/${subgraphName}`
  var graphQLClient = new GraphQLClient(endpoint)

  var query = gql`
  query get_tvl($block: Int) {
    symmetrics(
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
  return results.symmetrics[0].totalLiquidity;
}

async function xdai(timestamp, ethBlock, chainBlocks) {
  return toUSDTBalances(await getTVL("symmetric-xdai", await getBlock(timestamp, "xdai", chainBlocks)))
}

async function celo(timestamp, ethBlock, chainBlocks) {
  return toUSDTBalances(await getTVL("symmetric-celo", await getBlock(timestamp, "celo", chainBlocks)))
}

module.exports = {
  misrepresentedTokens: true,
  methodology: `Symmetric is an Automated Market Maker (AMM) and a Decentralized Exchange (DEX), running on the Celo and xDai networks.
  Symmetric TVL is pulled from the Symmetric subgraph and includes deposits made to Symmetric xDai and Symmetric Celo liquidity pools.`,
  celo:{
    tvl: celo
  },
  xdai:{
    tvl: xdai
  },
  tvl: sdk.util.sumChainTvls([xdai, celo])
}
