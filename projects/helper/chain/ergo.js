const ADDRESSES = require('../coreAssets.json')
const axios = require("axios")
const sdk = require('@defillama/sdk')
const chain = 'ergo'

const API_HOST = 'https://api.ergoplatform.com/api/v1'

const nullAddress = ADDRESSES.null

async function queryTree({ address, params = {}}) {
  const { data } = await axios.get(`${API_HOST}/boxes/unspent/byErgoTree/${address}`, {
    params,
  })
  return data
}

async function getTokens({ address, balances = {}, tokens = [], blacklistedTokens = [] }) {
  const { data: { confirmed: { nanoErgs, tokens: tokenData}}} = await axios.get(`${API_HOST}/addresses/${address}/balance/total`)
  tokenData.push({ tokenId: nullAddress, amount: nanoErgs ?? 0 })
  tokenData.forEach(({ tokenId, amount }) => {
    if (tokens.length && !tokens.includes(tokenId)) return; // sum only whitelistedTokens
    if (blacklistedTokens.includes(tokenId)) return; // skip blacklisted tokens
    sdk.util.sumSingleBalance(balances, tokenId, amount, chain)
  })
}

async function sumTokens({ owners = [], tokens = [], balances = {}, blacklistedTokens = [], tokensAndOwners = [], owner,}) {
  if (owner) owners = [owner]
  if (tokensAndOwners.length) {
    await Promise.all(tokensAndOwners.map(([token, owner]) => sumTokens({ owners: [owner], tokens: [token], balances, blacklistedTokens, })))
    return balances
  }

  await Promise.all(owners.map(i => getTokens({ address: i, balances, tokens, blacklistedTokens, })))
  return balances
}

function sumTokensExport(args) {
  return () => sumTokens(args)
}

module.exports = {
  sumTokens,
  sumTokensExport,
}