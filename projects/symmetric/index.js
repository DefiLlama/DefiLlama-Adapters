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

async function xdai(timestamp, ethBlock, chainBlocks) {
  const [v1,v2] = await Promise.all([getTVL("cent-swap-xdai", ethBlock), getTVL("symmetric-v2-gnosis", ethBlock)])
  return toUSDTBalances(BigNumber(v1).plus(v2))
}

async function celo(timestamp, ethBlock, chainBlocks) {
  const [v1,v2] = await Promise.all([getTVL("cent-swap-celo", ethBlock), getTVL("symmetric-v2-celo", ethBlock)])
  return toUSDTBalances(BigNumber(v1).plus(v2))
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  methodology: `Symmetric is an Automated Market Maker (AMM) and a Decentralized Exchange (DEX), running on the Celo and Gnosis networks.
  Symmetric TVL is pulled from the Symmetric subgraph and includes deposits made to Symmetric Gnosis and Symmetric Celo on V1 & V2 liquidity pools.`,
  celo:{
    tvl: celo
  },
  xdai:{
    tvl: xdai
  },
  tvl: sdk.util.sumChainTvls([xdai, celo])
}
