const retry = require('./helper/retry')
const { GraphQLClient, gql } = require('graphql-request')

async function fetch() {
  var totalValue = 0;

  var graphQLClient = new GraphQLClient('https://api.thegraph.com/subgraphs/name/waka-finance/waka-graph')
  var reserveQuery = gql`
  {
    pairs {
      reserveUSD
    }
  }`;
  var reserveResult = await retry(async bail => await graphQLClient.request(reserveQuery))
  var reserves = reserveResult.pairs;

  for (var i = 0; i < reserves.length; i ++) {
    var reserveUSD = Number(reserves[i].reserveUSD);
    totalValue += reserveUSD;
  }
  
  return totalValue;
}

module.exports = {
  fantom:{
    fetch,
  },
  fetch
}