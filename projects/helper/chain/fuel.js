
const { GraphQLClient, } = require('graphql-request')
const { transformBalances } = require('../portedTokens')
const { fuel: { query } } = require('./rpcProxy')
const { getEnv } = require('../env')
const { sleep } = require('../utils')
const client = new GraphQLClient(getEnv('FUEL_CUSTOM_RPC'))

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
  const chunkSize = 20;

  for (let i = 0; i < owners.length; i += chunkSize) {
    const chunk = owners.slice(i, i + chunkSize);
    const query = chunk.map((o, idx) => `q${idx}: contractBalances(
        filter: { contract: "${o}" }, first: 1000
        ) { nodes { assetId amount } }`).join('\n');

    const results = await client.request(`{${query}}`)
    Object.values(results).forEach(result => {
      result.nodes.forEach(node => {
        api.add(node.assetId, node.amount);
      })
    })
    await sleep(2000) // avoid hitting rate limits
    api.log(`fuel: Processed ${Math.min(i + chunkSize, owners.length)}/${owners.length} owners...`)
  }
}

module.exports = {
  sumTokens,
  query,
}