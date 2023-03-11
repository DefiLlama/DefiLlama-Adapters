const retry = require('async-retry')
const { GraphQLClient, gql } = require('graphql-request')

async function fetch() {
  var endpoint = 'https://api.thegraph.com/subgraphs/name/toxinlabs/acid';
  var graphQLClient = new GraphQLClient(endpoint)

  var query = gql`
{
  protocolMetrics(first: 1, orderBy: id, orderDirection: desc) {
    totalValueLocked
  }
}
  `;
  const results = await retry(async () => await graphQLClient.request(query))
  return parseFloat(results.protocolMetrics[0].totalValueLocked);
}

module.exports = {
  timetravel: false,
  ethereum: {
    tvl: () => ({}),
    staking: fetch
  },
}