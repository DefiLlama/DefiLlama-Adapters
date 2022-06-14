const { sumTokens } = require('../helper/unwrapLPs')
const { GraphQLClient, gql } = require('graphql-request')

const contracts = {
  euler: "0x27182842E098f60e3D576794A5bFFb0777E025d3",
  markets: '0xE5d0A7A3ad358792Ba037cB6eE375FfDe7Ba2Cd1',
  markets_proxy: '0x3520d5a913427E6F0D6A83E07ccD4A4da316e4d3',
}

// Graphql endpoint to query markets
const graphql_url = 'https://api.thegraph.com/subgraphs/name/euler-xyz/euler-mainnet'

async function ethereum(timestamp, ethBlock) {
  var graphQLClient = new GraphQLClient(graphql_url)

  const markets_query = gql`query {
      eulerMarketStores {
        markets {
          id
        }
        
      }
    }`

  const results = await graphQLClient.request(markets_query)
  const markets = results.eulerMarketStores[0].markets
  const markets_underlyings = markets.map(market => market.id)

  // use markets_underlyings or markets_underlyings_nographql
  const tokensAndOwners = markets_underlyings.map(underlying => [underlying, contracts.euler])
  return sumTokens({}, tokensAndOwners, ethBlock)
}

module.exports = {
  methodology: `Collateral (supply minus borrows) in the balance of the euler contract`,
  ethereum: {
    tvl: ethereum,
    // staking: staking(EULstaking, EUL),
  }
}
