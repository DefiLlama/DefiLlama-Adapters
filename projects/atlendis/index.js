const { GraphQLClient, gql } = require('graphql-request')
const { getBlock } = require("../helper/getBlock.js");
const { transformPolygonAddress } = require('../helper/portedTokens');


async function tvl (timestamp, block, chainBlocks) {
  const balances = {};
  const transform = await transformPolygonAddress();

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

  block = await getBlock(timestamp, "polygon", chainBlocks);

  // pull data
  const data = await graphQLClient.request(query, {
    block: block
  });

  // calculate TVL
  for (let i=0; i < data.poolStatuses.length; i++) {
    let amount = parseInt(data.poolStatuses[i].normalizedAvailableAmount)
               + parseInt(data.poolStatuses[i].normalizedBorrowedAmount)
               + parseInt(data.poolStatuses[i].adjustedPendingAmount);
    let assetAddress = data.poolStatuses[i].pool.parameters.underlyingToken;

    assetAddress = transform(assetAddress);
    balances[assetAddress] = (balances[assetAddress] || 0) + amount / 1e12;
  }

  return balances;
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  polygon: {
    tvl,
  },
};