const sdk = require('@defillama/sdk');
const BigNumber = require("bignumber.js");
const { GraphQLClient, gql } = require('graphql-request')
const { toUSDTBalances } = require('../helper/balances');
const { getBlock } = require('../helper/http');
async function getTVL(subgraphName, block, version = 'v1') {
  // delayed by around 5 mins to allow subgraph to update
  var endpoint = `https://api.thegraph.com/subgraphs/name/centfinance/${subgraphName}`
  var kavaEndPoint = 'https://subgraph.symmetric.exchange/subgraphs/name/centfinance/kava' 
  var graphQLClient = new GraphQLClient(endpoint)
  var graphQLClientKava = new GraphQLClient(kavaEndPoint)

  var v1 = gql`
  query get_tvl {
    symmetrics(
      first: 5,
    ) {
      totalLiquidity,
      totalSwapVolume
    }
  }
  `;
  var v2 = gql`
  query get_tvl {
    balancers(
      first: 5,
    ) {
      totalLiquidity,
      totalSwapVolume
    }
  }
  `;
  const results = subgraphName ==='kava' ? await graphQLClientKava.request(v2, {
  }) : await graphQLClient.request(version === 'v1' ? v1 : v2, {
  })
  return version ==='v1'? results.symmetrics[0].totalLiquidity : results.balancers[0].totalLiquidity;
}

async function xdai(timestamp, ethBlock, chainBlocks) {
  const [v1,v2] = await Promise.all([getTVL("symmetric-xdai", null, 'v1'), getTVL("symmetric-v2-gnosis", null, 'v2')])
  return toUSDTBalances(BigNumber(v1).plus(v2))
}

async function celo(timestamp, ethBlock, chainBlocks) {
  const [v1,v2] = await Promise.all([getTVL("symmetric-celo", null, 'v1'), getTVL("symmetric-v2-celo", null, 'v2')])
  return toUSDTBalances(BigNumber(v1).plus(v2))
}
async function kava(timestamp, ethBlock, chainBlocks) {
  const [v2] = await Promise.all([getTVL("kava", 0, 'v2')])
  return toUSDTBalances(BigNumber(v2))
}

module.exports = {
  misrepresentedTokens: true,
  methodology: `Symmetric is an Automated Market Maker (AMM) and a Decentralized Exchange (DEX), running on the Celo, and Gnosis networks.
  Symmetric TVL is pulled from the Symmetric subgraph and includes deposits made to Symmetric Gnosis and Symmetric Celo V1 & V2 liquidity pools.`,
  celo:{
    tvl: celo
  },
  xdai:{
    tvl: xdai
  },
  kava:{
    tvl: kava
  }
}
