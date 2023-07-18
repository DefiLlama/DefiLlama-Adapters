const ADDRESSES = require('../coreAssets.json')
const { get } = require('../http')
const { getCoreAssets, } = require('../tokenMapping')
const { transformBalances } = require('../portedTokens')
const sdk = require('@defillama/sdk')
const chain = 'elrond'

const API_HOST = 'https://api.multiversx.com'

async function getElrondBalance(address) {
  const { data: { account: { balance } } } = await get(`${API_HOST}/address/${address}`)
  return balance
}
const nullAddress = ADDRESSES.null

async function getTokens({ address, balances = {}, tokens = [], blacklistedTokens = [], whitelistedTokens = [], }) {
  const res = await get(`${API_HOST}/accounts/${address}/tokens?size=1000`)
  res.filter(i => i.type === 'FungibleESDT')
    .forEach(i => {
      const token = i.identifier
      if (tokens.length && !tokens.includes(token)) return; // sum only whitelistedTokens
      if (whitelistedTokens.length && !whitelistedTokens.includes(token)) return; // sum only whitelistedTokens
      if (blacklistedTokens.includes(token)) return; // skip blacklisted tokens
      return sdk.util.sumSingleBalance(balances, token, i.balance, chain)
    })
  return balances
}

async function sumTokens({ owners = [], tokens = [], balances = {}, blacklistedTokens = [], tokensAndOwners = [], whitelistedTokens = []}) {
  if (tokensAndOwners.length) {
    await Promise.all(tokensAndOwners.map(([token, owner]) => sumTokens({ owners: [owner], tokens: [token], balances, blacklistedTokens, whitelistedTokens, })))
    return balances
  }

  await Promise.all(owners.map(i => getTokens({ address: i, balances, tokens, blacklistedTokens, whitelistedTokens, })))
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