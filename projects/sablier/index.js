const { GraphQLClient, gql } = require('graphql-request')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { isWhitelistedToken } = require('../helper/streamingHelper')

const sablierAddresses = {
  "v1.0.0": "0xA4fc358455Febe425536fd1878bE67FfDBDEC59a",
  "v1.1.0": "0xCD18eAa163733Da39c232722cBC4E8940b1D8888",
}

const blacklistedTokens = [
  '0x57ab1e02fee23774580c119740129eac7081e9d3', // sUSD legacy
]

async function getTokens(isVesting) {
  const graphQLClient = new GraphQLClient('https://api.thegraph.com/subgraphs/name/sablierhq/sablier')
  var query = gql`{tokens (first: 1000) { id name symbol }}`
  const results = await graphQLClient.request(query)
  return results.tokens.filter(i => isWhitelistedToken(i.symbol, i.id, isVesting)).map(i => i.id)
}

async function tvl(_, block) {
  const tokens = await getTokens(false)
  return sumTokens2({ block, owners: Object.values(sablierAddresses), tokens: tokens, blacklistedTokens, })
}

async function vesting(_, block) {
  const tokens = await getTokens(true)
  return sumTokens2({ block, owners: Object.values(sablierAddresses), tokens: tokens, blacklistedTokens, })
}

module.exports = {
  hallmarks: [
    [Math.floor(new Date('2022-10-03')/1e3), 'Vesting tokens are not included in tvl'],
  ],
  start: 1573582731,
  ethereum: { tvl, vesting, }
};