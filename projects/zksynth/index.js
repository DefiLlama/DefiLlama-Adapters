// const retry = require('async-retry')
const { GraphQLClient, gql } = require('graphql-request')

async function fetch() {
  var endpoint = 'https://api.thegraph.com/subgraphs/name/prasad-kumkar/zksynth-mainnet';
  var graphQLClient = new GraphQLClient(endpoint)

  var query = gql`
  {
    pools(first: 10) {
      collaterals{
        totalDeposits
        priceUSD
        token{
          decimals
        }
      }
    }
  }
  `;
  const results = await graphQLClient.request(query);
  let tvl = 0;
  for(let i = 0; i < results.pools.length; i++){
    for(let j = 0; j < results.pools[i].collaterals.length; j++){
      tvl += results.pools[i].collaterals[j].totalDeposits * results.pools[i].collaterals[j].priceUSD / Math.pow(10, results.pools[i].collaterals[j].token.decimals);
    }
  }
  return tvl;
}

module.exports = {
  fetch
}