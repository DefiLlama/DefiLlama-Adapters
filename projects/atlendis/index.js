const { GraphQLClient, gql } = require('graphql-request')
const { getBlock } = require('../helper/http')
const sdk = require('@defillama/sdk')


async function fetchData(block, balances, transform, borrowed = false) {
  const baseUrl = 'https://api.thegraph.com/subgraphs/name/atlendis';
  const urlPolygon = `${baseUrl}/atlendis-hosted-service-polygon`;
  const graphQLClient = new GraphQLClient(urlPolygon)

  const query = gql`
  query get_tvl($block: Int) {
    poolStatuses (block: { number: $block }) {
      state
      pool {
        id
        identifier
        parameters {
          underlyingToken
        }
      }
      normalizedAvailableAmount
      normalizedBorrowedAmount
      adjustedPendingAmount
    }
  }
  `;

  // pull data
  const data = await graphQLClient.request(query, {
    block: block - 50
  });

  // calculate TVL
  const agEUR = 'polygon:0xe0b52e49357fd4daf2c15e02058dce6bc0057db4'.toLowerCase()
  if (!borrowed) {
    for (let i = 0; i < data.poolStatuses.length; i++) {
      let amount = parseInt(data.poolStatuses[i].normalizedAvailableAmount)
      let assetAddress = data.poolStatuses[i].pool.parameters.underlyingToken;

      assetAddress = transform(assetAddress);
      if (assetAddress === agEUR) amount *= 1e12
      sdk.util.sumSingleBalance(balances, assetAddress, amount / 1e12)
    }
  } else {
    for (let i = 0; i < data.poolStatuses.length; i++) {
      let amount = parseInt(data.poolStatuses[i].normalizedBorrowedAmount)
        + parseInt(data.poolStatuses[i].adjustedPendingAmount);
      let assetAddress = data.poolStatuses[i].pool.parameters.underlyingToken;

      assetAddress = transform(assetAddress);
      if (assetAddress === agEUR) amount *= 1e12
      sdk.util.sumSingleBalance(balances, assetAddress, amount / 1e12)
    }
  }
}


async function tvl(timestamp, _, chainBlocks) {
  const balances = {};
  const block = await getBlock(timestamp, 'polygon', chainBlocks)
  const transform = i => `polygon:${i}`;
  await fetchData(block, balances, transform);
  return balances;
}

async function borrowed(timestamp, _, chainBlocks) {
  const balances = {};
  const transform = i => `polygon:${i}`;
  const block = await getBlock(timestamp, 'polygon', chainBlocks)
  await fetchData(block, balances, transform, true);
  return balances;
}


module.exports = {
      polygon: {
    tvl,
    borrowed,
  }
};