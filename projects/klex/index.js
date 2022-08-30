const sdk = require('@defillama/sdk');
const BigNumber = require("bignumber.js");
const { GraphQLClient, gql } = require('graphql-request')
const { toUSDTBalances } = require('../helper/balances');

async function getTVL() {
  var endpoint = `https://graph-prod.klex.finance/subgraphs/name/klex-staging-2-mainnet`
  var graphQLClient = new GraphQLClient(endpoint)

  var query = gql`
  query get_tvl {
    pools (
      orderBy: totalLiquidity
      orderDirection: desc
    ){
      id
      name
      owner
      address
      totalLiquidity
    }
  }
  `;
  const results = await graphQLClient.request(query)

  results.pools.forEach(i => {
    if (+i.totalLiquidity > 1e10) console.log('bad pool: ', i)
  })
  return results.pools
    .map(i => +i.totalLiquidity)
    .filter(i => i < 1e10)  // we filter out if liquidity is higher than 10B as it is unlikely/error
    .reduce((acc, i) => acc + i, 0)
}

async function getTVLFromPools() {
  var endpoint = `https://graph-prod.klex.finance/subgraphs/name/klex-staging-2-mainnet`
  var graphQLClient = new GraphQLClient(endpoint)

  var query = gql`
  query get_tvl {
    pools (
      orderBy: totalLiquidity
      orderDirection: desc
    ) {
      totalLiquidity
      name
      tokens
    }
  }
  `;
  const results = await graphQLClient.request(query)
  results.pools.forEach(i => {
    if (+i.totalLiquidity > 1e10) console.log('bad pool: ', i)
  })
  return results.pools
    .map(i => +i.totalLiquidity)
    .filter(i => i < 1e10)  // we filter out if totalLiquidity is higher than 10B as it is unlikely/error
    .reduce((acc, i) => acc + i, 0)
}

async function klaytn(timestamp, ethBlock, chainBlocks) {
  return toUSDTBalances(await getTVL())
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  methodology: `KLEX TVL is pulled from the KLEX subgraph and includes deposits made to KLEX liquidity pools.`,
  klaytn:{
    tvl: klaytn
  },
}
