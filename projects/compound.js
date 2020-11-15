const retry = require('async-retry')
const axios = require("axios");
const { GraphQLClient, gql } = require('graphql-request')

async function fetch() {

    var endpoint ='https://api.thegraph.com/subgraphs/name/graphprotocol/compound-v2';
    var graphQLClient = new GraphQLClient(endpoint)

    var query = gql`
    {
      markets(first: 15) {
        borrowRate
        cash
        collateralFactor
        exchangeRate
        interestRateModelAddress
        name
        reserves
        supplyRate
        symbol
        id
        totalBorrows
        totalSupply
        underlyingAddress
        underlyingName
        underlyingPrice
        underlyingSymbol
        reserveFactor
        underlyingPriceUSD
      }
    }

    `;
    const results = await retry(async bail => await graphQLClient.request(query))
    var tvl = 0;
    results.markets.map(async (item) => {
        var market = item.underlyingPriceUSD * parseFloat(item.cash);
        tvl += market
    })
    return tvl;
}

module.exports = {
  fetch
}
