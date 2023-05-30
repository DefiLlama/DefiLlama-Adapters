const { sumTokens2 } = require('../helper/unwrapLPs')
const { covalentGetTokens } = require('../helper/http')
const { isWhitelistedToken } = require('../helper/streamingHelper')
const { getUniqueAddresses } = require('../helper/utils')

const sablierAddresses = {
  "v1.0.0": "0xA4fc358455Febe425536fd1878bE67FfDBDEC59a",
  "v1.1.0": "0xCD18eAa163733Da39c232722cBC4E8940b1D8888",
}

const blacklistedTokens = [
  '0x57ab1e02fee23774580c119740129eac7081e9d3', // sUSD legacy
  '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359',
  '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
  '0x57ab1e02fee23774580c119740129eac7081e9d3',
]

async function getTokens(api, isVesting) {
  // const graphQLClient = new GraphQLClient('https://api.thegraph.com/subgraphs/name/sablierhq/sablier')
  // var query = gql`{tokens (first: 1000) { id name symbol }}`
  // const results = await graphQLClient.request(query)
  let tokens = (await Promise.all(Object.values(sablierAddresses).map(i => covalentGetTokens(i, 'ethereum')))).flat().filter(i => !blacklistedTokens.includes(i))
  tokens = getUniqueAddresses(tokens)
  const symbols = await api.multiCall({ abi: 'erc20:symbol', calls: tokens })
  return tokens.filter((v, i) => isWhitelistedToken(symbols[i], v, isVesting))
}

async function tvl(_, block, _1, { api }) {
  const tokens = await getTokens(api, false)
  return sumTokens2({ api, owners: Object.values(sablierAddresses), tokens, blacklistedTokens, })
}

async function vesting(_, block, _1, { api }) {
  const tokens = await getTokens(api, true)
  return sumTokens2({ api, owners: Object.values(sablierAddresses), tokens, blacklistedTokens, })
}

module.exports = {
  hallmarks: [
    [Math.floor(new Date('2022-10-03') / 1e3), 'Vesting tokens are not included in tvl'],
  ],
  start: 1573582731,
  timetravel: false,
  ethereum: { tvl, vesting, }
};