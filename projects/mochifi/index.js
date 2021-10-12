const sdk = require('@defillama/sdk');
const { GraphQLClient, gql } = require('graphql-request');

const BLOCK_SHIFT = 10

const endpoints = {
  ethereum: 'https://api.thegraph.com/subgraphs/name/ryuheimat/mochi-staging',
}

const query = gql`
query get_tvl($block: Int) {
  vaults(
    first: 1000,
    block: { number: $block }
  ) {
    asset
    deposits
  }
}
`;

async function ethereum(timestamp, block, chainBlocks) {
  const graphQLClient = new GraphQLClient(endpoints.ethereum);
  const { vaults } = await graphQLClient.request(
    query,
    { block: +block - BLOCK_SHIFT }
  );
  const results = vaults
    .filter(v => +v.deposits > 0)
    .reduce((acc, v) => {
      acc[v.asset] = v.deposits
      return acc
    }, {})
  return results
}

module.exports = {
  ethereum: {
    tvl: ethereum
  },
  tvl: sdk.util.sumChainTvls([ethereum])
}