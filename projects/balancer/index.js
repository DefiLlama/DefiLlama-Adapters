const { toUSDTBalances } = require('../helper/balances');
const { GraphQLClient, gql } = require('graphql-request')

async function tvl(timestamp, ethBlock) {
  var endpoint ='https://api.thegraph.com/subgraphs/name/balancer-labs/balancer';
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
    block: ethBlock
  })
  return toUSDTBalances(results.balancers[0].totalLiquidity);

}

module.exports = {
  ethereum:{
    tvl
  },
  tvl
}
