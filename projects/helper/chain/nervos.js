const sdk = require('@defillama/sdk')
const { get } = require('../http')

// Nervos CKB L1 (ckb1... addresses), balances via the official explorer api
const EXPLORER_API = 'https://mainnet-api.explorer.nervos.org/api/v1'
const HEADERS = { Accept: 'application/vnd.api+json', 'Content-Type': 'application/vnd.api+json' }
const CKB_DECIMALS = 8

// total CKB (whole coins) held by an address
async function getCkbBalance(owner) {
  const { data } = await get(`${EXPLORER_API}/addresses/${owner}`, { headers: HEADERS })
  const attributes = data?.[0]?.attributes
  if (!attributes) throw new Error(`nervos: no explorer data for ${owner}`)
  return Number(attributes.balance) / 10 ** CKB_DECIMALS
}

async function sumTokens({ balances = {}, owners = [], api }) {
  if (api) balances = api.getBalances()
  for (const owner of owners)
    sdk.util.sumSingleBalance(balances, 'nervos-network', await getCkbBalance(owner))
  return balances
}

module.exports = {
  getCkbBalance,
  sumTokens,
}
