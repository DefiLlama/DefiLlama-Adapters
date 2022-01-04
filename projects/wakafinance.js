const retry = require('./helper/retry')
const { GraphQLClient, gql } = require('graphql-request')
const { toUSDTBalances } = require('./helper/balances');

async function tvl(_timestamp, _ethBlock, chainBlocks) {
  var totalValue = 0;

  var graphQLClient = new GraphQLClient('https://api.thegraph.com/subgraphs/name/waka-finance/waka-graph')
  var reserveQuery = gql`
  query get_tvl($block: Int) {
    pairs (
      block: { number: $block }
    ) {
      reserveUSD
    }
  }`;
  var reserveResult = await retry(async bail => await graphQLClient.request(reserveQuery, {
    block: chainBlocks.fantom
  }))
  var reserves = reserveResult.pairs;

  for (var i = 0; i < reserves.length; i ++) {
    var reserveUSD = Number(reserves[i].reserveUSD);
    totalValue += reserveUSD;
  }
  
  return toUSDTBalances(totalValue);
}

module.exports = {
  misrepresentedTokens: true,
  fantom:{
    tvl,
  },
  tvl
}