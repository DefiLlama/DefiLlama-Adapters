const { nullAddress } = require('../tokenMapping')
const { getFixBalances } = require('../portedTokens')
const { getJson } = require('./stacks-api')
const sdk = require('@defillama/sdk')
const chain = 'stacks'

// v1 /extended/v1/address/{address}/balances is deprecated; rebuild its shape from the v3 endpoints
async function getStacksBalances(address) {
  const stx = await getJson(`https://api.mainnet.hiro.so/extended/v3/principals/${address}/balances/stx`)
  const fungible_tokens = {}
  let cursor
  do {
    let url = `https://api.mainnet.hiro.so/extended/v3/principals/${address}/balances/ft?limit=100`
    if (cursor) url += `&cursor=${encodeURIComponent(cursor)}`
    const res = await getJson(url)
    res.results.forEach(({ asset_identifier, balance }) => fungible_tokens[asset_identifier] = { balance })
    cursor = res.cursor?.next
  } while (cursor)
  return { stx, fungible_tokens }
}

async function addStacks(address, balances = {}) {
  const stx_balance = (await getStacksBalances(address)).stx.balance
  sdk.util.sumSingleBalance(balances, nullAddress, stx_balance, chain)
  return balances
}

async function addTokens(address, { balances = {}, tokens = [], blacklistedTokens = [] }) {
  const {
    fungible_tokens, stx,
  } = await getStacksBalances(address)
  
  if ((!tokens.length || tokens.includes(nullAddress)) && (!blacklistedTokens.length || !blacklistedTokens.includes(nullAddress)))
    sdk.util.sumSingleBalance(balances, nullAddress, stx.balance, chain)

  Object.keys(fungible_tokens)
    .filter(token => {
      if (tokens.length && !tokens.includes(token)) return false
      if (blacklistedTokens.length && (blacklistedTokens.includes(token) || blacklistedTokens.includes(token.split('::')[0]))) return false
      return true
    })
    .forEach(token => sdk.util.sumSingleBalance(balances, token, fungible_tokens[token].balance, chain))
}

async function sumTokens({ owner, owners = [], tokens = [], balances = {}, blacklistedTokens = [], tokensAndOwners = [] }) {
  if (tokensAndOwners.length) {
    await Promise.all(tokensAndOwners.map(([token, owner]) => addTokens(owner, { tokens: [token], balances, blacklistedTokens, })))
    return balances
  }
  if (owner) owners = [owner]

  await Promise.all(owners.map(i => addTokens(i, { balances, tokens, blacklistedTokens, })))
  const transform = getFixBalances(chain)
  return transform(balances)
}

module.exports = {
  sumTokens,
  addStacks,
}