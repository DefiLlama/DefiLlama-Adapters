const sdk = require('@defillama/sdk');
const {GraphQLClient, gql} = require('graphql-request')
const {toUSDTBalances} = require('../helper/balances');
const {getBlock} = require('../helper/getBlock');

async function getTVL(subgraphName, block) {
    const endpoint = `https://api.thegraph.com/subgraphs/name/mcdexio/${subgraphName}`
    const graphQLClient = new GraphQLClient(endpoint)

    const query = gql`
  query getTvl($block: Int) {
  factories(
    block: { number: $block }
  ) {
    id
    totalValueLockedUSD
  }
}
  `;
    const results = await graphQLClient.request(query, {
        block
    })
    return results.factories[0].totalValueLockedUSD;
}

async function arbitrum(timestamp, ethBlock, chainBlocks) {
    return toUSDTBalances(await getTVL("mcdex3-arb-perpetual", await getBlock(timestamp, "arbitrum", chainBlocks)))
}

module.exports = {
    misrepresentedTokens: true,
    methodology: `Includes all locked liquidity in AMM pools, pulling the data from TheGraph hosted 'mcdexio/mcdex3-arb-perpetual' subgraph`,
    arbitrum: {
        tvl: arbitrum
    },
    tvl: sdk.util.sumChainTvls([arbitrum])
}
