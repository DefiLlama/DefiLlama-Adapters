const { GraphQLClient, gql } = require('graphql-request');
// node test.js projects/mochifi/index.js
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
  delete results['0x60ef10edff6d600cd91caeca04caed2a2e605fe5']
  return results
}

module.exports = {
  methodology: "TVL counts collateral deposits to mint USDM",
  ethereum: {
    tvl: ethereum
  },
}
