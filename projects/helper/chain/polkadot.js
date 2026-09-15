const sdk = require('@defillama/sdk')
const { post } = require('../http')
const { sleep } = require('../utils')
const { getEnv } = require('../env')

const endpoint = host => `https://${host}.api.subscan.io/api/v2/scan/search`

// Polkadot moved account balances off the relay chain onto Asset Hub, so the relay
// chain now reports 0 for accounts that still hold DOT. Query both and take the sum
// so this keeps working either side of the migration.
const hosts = ['assethub-polkadot', 'polkadot']

// Subscan allows 2 requests/second. Space calls out to stay under it, 
// and retry with backoff if we still get throttled.
const REQUEST_GAP_MS = 600
const MAX_RETRIES = 5

// Module-level limiter: the quota is per API key, so concurrent callers of this helper
// (several CEX adapters in one process) must share one queue rather than pacing themselves.
let lock = Promise.resolve()
let lastRequestAt = 0

async function withLimiter(fn) {
  const prev = lock
  let release
  lock = new Promise(resolve => { release = resolve })
  await prev
  try {
    const wait = lastRequestAt + REQUEST_GAP_MS - Date.now()
    if (wait > 0) await sleep(wait)
    return await fn()
  } finally {
    lastRequestAt = Date.now()
    release()
  }
}

async function subscanPost(host, key) {
  return withLimiter(async () => {
    for (let attempt = 0; ; attempt++) {
      try {
        return await post(endpoint(host), { key }, { headers: { 'x-api-key': getEnv('SUBSCAN_API_KEY') } })
      } catch (e) {
        if (attempt >= MAX_RETRIES) throw e
        await sleep(1000 * (attempt + 1))
      }
    }
  })
}

async function getBalance(key) {
  let total = 0
  for (const host of hosts) {
    const data = await subscanPost(host, key)
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