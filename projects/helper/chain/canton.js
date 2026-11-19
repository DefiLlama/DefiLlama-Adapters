const sdk = require('@defillama/sdk')
const { get } = require('../http')
const { getEnv } = require('../env')

// CANTON_API holds both the api base url and the key: <base url>?key=<api key>
function getApiConfig() {
  const value = getEnv('CANTON_API')
  if (!value) throw new Error('CANTON_API is not set')
  const url = new URL(value)
  const key = url.searchParams.get('key')
  if (!key) throw new Error('CANTON_API is missing the ?key= api key')
  url.searchParams.delete('key')
  return { baseUrl: url.toString().replace(/\/$/, ''), headers: { Authorization: `Bearer ${key}` } }
}

// total CC (Canton Coin) held by a party, locked + unlocked
async function getPartyBalance(party) {
  const { baseUrl, headers } = getApiConfig()
  const { balance } = await get(`${baseUrl}/parties/${party}/balance`, { headers })
  return Number(balance.total_coin_holdings)
}

async function sumTokens({ balances = {}, owners = [], api }) {
  if (api) balances = api.getBalances()
  for (const owner of owners)
    sdk.util.sumSingleBalance(balances, 'canton-network', await getPartyBalance(owner))
  return balances
}

module.exports = {
  getPartyBalance,
  sumTokens,
}
