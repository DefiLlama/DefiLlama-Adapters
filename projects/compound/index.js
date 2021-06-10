const { GraphQLClient, gql } = require('graphql-request')
const sdk = require('@defillama/sdk');
const BigNumber = require('bignumber.js')
const endpoint ='https://api.thegraph.com/subgraphs/name/graphprotocol/compound-v2';

async function tvl(timestamp, block) {
    const graphQLClient = new GraphQLClient(endpoint)

    var query = gql`
    query get_tvl($block: Int) {
      markets(
        first: 100,
        block: { number: $block }
      ) {
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
    const results = await graphQLClient.request(query, {
      block
    })
    const balances = {}
    const decimals = (await sdk.api.abi.multiCall({
      block,
      abi: 'erc20:decimals',
      calls: results.markets.map(item=>({
        target: item.underlyingAddress
      }))
    })).output
    results.markets.map(async (item, index) => {
      sdk.util.sumSingleBalance(balances, item.underlyingAddress, BigNumber(item.cash).times(10**Number(decimals[index].output || 18)).toFixed(0))
    })
    return balances;
}

module.exports = {
  ethereum:{
    tvl,
  },
  tvl
}
