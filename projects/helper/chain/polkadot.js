const sdk = require('@defillama/sdk')
const { post } = require('../http')
const { sleep } = require('../utils')
const { getEnv } = require('../env')

const endpoint = host => `https://${host}.api.subscan.io/api/v2/scan/search`

// Polkadot moved account balances off the relay chain onto Asset Hub, so the relay
// chain now reports 0 for accounts that still hold DOT. Query both and take the sum
// so this keeps working either side of the migration.
const hosts = ['assethub-polkadot', 'polkadot']

async function getBalance(key) {
  let total = 0
  for (const host of hosts) {
    const data = await post(endpoint(host), { key }, { headers: { 'x-api-key': getEnv('SUBSCAN_API_KEY') } })
    total += +(data?.data?.account?.balance ?? 0)
  }
  return total
}

async function sumTokens({ balances = {}, owners = [] }) {
  let total = 0
  for (const owner of owners) {
    const balance = await getBalance(owner)
    total += balance
  }
  sdk.util.sumSingleBalance(balances, 'polkadot', total)
  return balances
}

module.exports = {
  sumTokens
}