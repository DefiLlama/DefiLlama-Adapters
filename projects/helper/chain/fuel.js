
const { GraphQLClient, } = require('graphql-request')
const { transformBalances } = require('../portedTokens')
const client = new GraphQLClient('https://mainnet.fuel.network/v1/graphql')

async function sumTokens({ api, owner, owners, token, tokens = [], tokensAndOwners = [] }) {
  if (token)
    tokens = [token]
  if (owner)
    owners = [owner]

  if (owners.length && !tokens.length) {
    await addAllTokenBalances({ api, owners })
  } else if (owners.length)
    tokensAndOwners = tokens.map(token => owners.map(owner => [token, owner])).flat()

  tokensAndOwners = getUniqueToA(tokensAndOwners)

  if (tokensAndOwners.length) {
    const query = tokensAndOwners.map(([token, owner], i) => `q${i}: contractBalance(
    contract: "${owner}"  asset: "${token}"
  ) { contract assetId amount}`).join('\n');

    const results = await client.request(`{${query}}`)
    Object.values(results).forEach(i => api.add(i.assetId, i.amount))
  }

  return transformBalances('fuel', api.getBalances())

  function getUniqueToA(toa) {
    toa = toa.map(i => i.join('-').toLowerCase())
    toa = new Set(toa)
    return [...toa].map(i => i.split('-'))
  }
}

async function addAllTokenBalances({ api, owners = [] }) {

  for (const owner of owners) {
    const query = `contractBalances(
        filter: { contract: "${owner}" }, first: 1000
      ) { nodes { assetId amount } }`

    const results = await client.request(`{${query}}`)
    results.contractBalances.nodes.forEach(node => {
      api.add(node.assetId, node.amount);
    })
  }
}

module.exports = {
  sumTokens,
}