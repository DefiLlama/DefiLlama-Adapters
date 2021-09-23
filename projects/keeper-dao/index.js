const retry = require('../helper/retry')
const sdk = require("@defillama/sdk");
const { GraphQLClient, gql } = require('graphql-request')

const oldEndpoint = 'https://api.thegraph.com/subgraphs/name/keeperdao/keeperdao';
const newEndpoint = 'https://api.thegraph.com/subgraphs/name/keeperdao/keeperdao-v2'

async function liquidtyPoolTvl(balances, endpoint, ethBlock) {
  var graphQLClient = new GraphQLClient(endpoint)

  var query = gql`
    {
      liquidityPoolSupplies(block: { number: ${ethBlock}}) {
        id
        supply
      }
    }
    `;

  const results = await retry(async bail => await graphQLClient.request(query))
  results.liquidityPoolSupplies.map(token => {
    sdk.util.sumSingleBalance(balances, token.id === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" ? "0x0000000000000000000000000000000000000000" : token.id, token.supply)
  })
}

async function tvl(timestamp, ethBlock) {
  const balances = {};
  await liquidtyPoolTvl(balances, newEndpoint, ethBlock)
  await liquidtyPoolTvl(balances, oldEndpoint, ethBlock)

  return balances
}

module.exports = {
  tvl
}