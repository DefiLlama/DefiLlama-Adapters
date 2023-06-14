const ADDRESSES = require('../coreAssets.json')
const { get, graphQuery } = require('../http')
const { getCoreAssets, } = require('../tokenMapping')
const { transformBalances } = require('../portedTokens')
const sdk = require('@defillama/sdk')
const chain = 'elrond'

const API_HOST = 'https://api.multiversx.com'
const MAIAR_GRAPH = 'http://graph.xexchange.com/graphql'
const unknownTokenList = ["CYBER-489c1c", "CPA-97530a"]
let prices

async function getTokenPrices() {
  if (!prices) prices = _getPrices()
  return prices

  async function _getPrices() {
    const query = `{
      tokens (identifiers: ${JSON.stringify(unknownTokenList)}){
        price
        decimals
        derivedEGLD
        identifier
      }
    }`
    const { tokens } = await graphQuery(MAIAR_GRAPH, query)
    const res = {}
    tokens.forEach(i => res[i.identifier] = i.derivedEGLD * 1e18/(10 ** i.decimals))
    return res
  }
}

async function getElrondBalance(address) {
  const { data: { account: { balance } } } = await get(`${API_HOST}/address/${address}`)
  return balance
}
const nullAddress = ADDRESSES.null

async function getTokens({ address, balances = {}, tokens = [], blacklistedTokens = [] }) {
  const prices = await getTokenPrices()
  const coreAssets = new Set(getCoreAssets('elrond'))
  const res = await get(`${API_HOST}/accounts/${address}/tokens?size=1000`)
  res.filter(i => i.type === 'FungibleESDT')
    .forEach(i => {
      const token = i.identifier
      if (tokens.length && !tokens.includes(token)) return; // sum only whitelistedTokens
      if (blacklistedTokens.includes(token)) return; // skip blacklisted tokens
      if (!coreAssets.has(token)) {
        if (i.valueUsd)
          return sdk.util.sumSingleBalance(balances, 'ethereum:' + ADDRESSES.ethereum.USDT, i.valueUsd * 1e6)

        if (prices[token])
          return sdk.util.sumSingleBalance(balances, nullAddress, (prices[token] * i.balance).toFixed(0), chain)
      }
      return sdk.util.sumSingleBalance(balances, token, i.balance / (10 ** i.decimals), chain)
    })
  return balances
}

async function sumTokens({ owners = [], tokens = [], balances = {}, blacklistedTokens = [], tokensAndOwners = []}) {
  if (tokensAndOwners.length) {
    await Promise.all(tokensAndOwners.map(([token, owner]) => sumTokens({ owners: [owner], tokens: [token], balances, blacklistedTokens, })))
    return balances
  }

  await Promise.all(owners.map(i => getTokens({ address: i, balances, tokens, blacklistedTokens, })))
  if (!tokens.length || tokens.includes(nullAddress))
    await Promise.all(owners.map(async i => {
      const bal = await getElrondBalance(i)
      sdk.util.sumSingleBalance(balances, nullAddress, bal, chain)
    }))
  return transformBalances(chain, balances)
}

module.exports = {
  sumTokens,
}