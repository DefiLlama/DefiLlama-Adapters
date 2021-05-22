const retry = require('./helper/retry')
const axios = require("axios");
const { __Directive } = require('graphql');
const { GraphQLClient, gql } = require('graphql-request')

async function fetchExchangeTVL() {

  var totalValue = 0;

  // total liquidity value
  var exchangeFetchData = [
    {
      address: '0x8a93b6865c4492ff17252219b87ea6920848edc0',
      endpoint: 'https://api.thegraph.com/subgraphs/name/swipewallet/exchange',
    },
    {
      address: '0x7810d4b7bc4f7faee9deec3242238a39c4f1197d',
      endpoint: 'https://api.bscgraph.org/subgraphs/id/QmdWgpk8reg9ZfjUQZqpmApANMQWPRLYUX2wweDRjghQGb',
    }      
  ];

  for (var i = exchangeFetchData.length - 1; i >= 0; i--) {
    var graphQLClient = new GraphQLClient(exchangeFetchData[i].endpoint)

    var query = gql`
    {
     factory(id: "${exchangeFetchData[i].address}"){
      volumeUSD
      liquidityUSD
      txCount
     }
    }
    `;
    var results = await retry(async bail => await graphQLClient.request(query))

    totalValue += Number(results.factory.liquidityUSD)      
  }

  return totalValue;
}

async function fetchSwipeSwapTVL() {
    var totalValue = 0;

    var graphQLUrls = [
      {
        "exchange": "https://api.thegraph.com/subgraphs/name/swipewallet/exchange",
      },
      {
        "exchange": "https://api.bscgraph.org/subgraphs/id/QmdWgpk8reg9ZfjUQZqpmApANMQWPRLYUX2wweDRjghQGb",
      },
    ]

    // total farming value
    for (var j = 0; j < graphQLUrls.length; j ++) {
      var graphQLClient = new GraphQLClient(graphQLUrls[j]["exchange"])
      var reserveQuery = gql`
      {
        pairs {
          id,
          reserveUSD
          totalSupply
        }
      }`;
      var reserveResult = await retry(async bail => await graphQLClient.request(reserveQuery))
      var reserves = reserveResult.pairs;

      for (var i = 0; i < reserves.length; i ++) {
        var reserveUSD = Number(reserves[i].reserveUSD);
        totalValue += reserveUSD;
      }
    }
    
    return totalValue;
}

async function fetch() {
  //const exchangeValue = await fetchExchangeTVL();
  const swipewapValue = await fetchSwipeSwapTVL();
  const totalValue = swipewapValue;
  return totalValue;
}

module.exports = {
  fetch
}
