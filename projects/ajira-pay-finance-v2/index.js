const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2, sumTokensExport } = require('../helper/unwrapLPs')
const { covalentGetTokens } = require('../helper/token')
const { isWhitelistedToken } = require('../helper/streamingHelper')
const { getUniqueAddresses } = require('../helper/utils')

const config = {
  linea: { owners: ['0xD2AA294B9A5097F4A09fd941eD0bE665bd85Eab2'], },
}

const blacklistedTokens = [
  ADDRESSES.ethereum.sUSD_OLD,
  ADDRESSES.ethereum.SAI.toLowerCase(),
  ADDRESSES.ethereum.MKR,
]

async function getTokens(api, owners, isVesting) {
  let tokens = (await Promise.all(owners.map(i => covalentGetTokens(i, api, { onlyWhitelisted: false, })))).flat().filter(i => !blacklistedTokens.includes(i))
  tokens = getUniqueAddresses(tokens)
  const symbols = await api.multiCall({ abi: 'erc20:symbol', calls: tokens })
  return tokens.filter((v, i) => isWhitelistedToken(symbols[i], v, isVesting))
}

async function tvl(_, block, _1, { api }) {
  const { owners } = config[api.chain]
  const tokens = await getTokens(api, owners, false)
  return sumTokens2({ api, owners, tokens, blacklistedTokens, })
}

async function vesting(_, block, _1, { api }) {
  const { owners } = config[api.chain]
  const tokens = await getTokens(api, owners, true)
  return sumTokens2({ api, owners, tokens, blacklistedTokens, })
}

module.exports = {
  methodology: "TVL is based on the active balances of assets deposited at the V2 stream vaults for token streaming and vesting.",
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl, vesting }
})