const { GraphQLClient, } = require('graphql-request')

async function tvl() {
    var endpoint = 'https://api.liqwiddev.net/graphql'
    var graphQLClient = new GraphQLClient(endpoint)

    var query = ` {
      markets {
        totalSupply
        marketId
    }
   } `;
    var results = await graphQLClient.request(query)
    return {cardano:results.markets.find(i => i.marketId === 'Ada').totalSupply / 1e6}
}

module.exports = {
  cardano: {
    tvl
  },
  
}