const sdk = require('@defillama/sdk')
const { get, post } = require('../http')
const { sleep } = require('../utils')
const { getEnv } = require('../env')

const { substrate } = sdk.chains

// Polkadot moved account balances off the relay chain onto Asset Hub, so the relay
// chain now reports 0 for accounts that still hold DOT. Query both and take the sum
// so this keeps working either side of the migration.
//
// Three independent sources, tried in this order:
//   1. public JSON-RPC nodes (state_getStorage on System.Account via sdk.chains.substrate) - keyless,
//      endpoints rotated on failure (POLKADOT_RELAY_RPC / POLKADOT_ASSETHUB_RPC, comma separated)
//   2. Parity's public Sidecar - keyless, but the relay-chain instance 429s under ~5 concurrent calls
//   3. Subscan - 2 req/s per key and the key is shared by every CEX adapter in the run, so it 429s under load
// RPC and Sidecar are shuffled per call so load alternates between them; Subscan is always last.

const DOT_DECIMALS = 1e10

const rpcChains = ['polkadot_relay', 'polkadot_assethub']

const sidecarHosts = ['polkadot-public-sidecar', 'polkadot-asset-hub-public-sidecar']
const sidecarUrl = (host, account) => `https://${host}.parity-chains.parity.io/accounts/${account}/balance-info`

const subscanHosts = ['assethub-polkadot', 'polkadot']
const subscanUrl = host => `https://${host}.api.subscan.io/api/v2/scan/search`

const shuffle = (arr) => arr.map(v => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(([, v]) => v)

// ---- 1. raw storage read -------------------------------------------------------------------

// System.Account free + reserved on both chains, in DOT
async function getBalanceRpc(account) {
  let total = 0
  for (const chain of rpcChains) {
    const { free, reserved } = await substrate.getSystemAccount({ chain, address: account })
    total += Number(BigInt(free) + BigInt(reserved)) / DOT_DECIMALS
  }
  return total
}

// ---- 2. sidecar ----------------------------------------------------------------------------

async function getBalanceSidecar(account) {
  let total = 0
  for (const host of sidecarHosts) {
    const data = await get(sidecarUrl(host, account))
    total += (+(data.free ?? 0) + +(data.reserved ?? 0)) / DOT_DECIMALS
  }
  return total
}

// ---- 3. subscan ----------------------------------------------------------------------------

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
        return await post(subscanUrl(host), { key }, { headers: { 'x-api-key': getEnv('SUBSCAN_API_KEY') } })
      } catch (e) {
        if (attempt >= MAX_RETRIES) throw e
        await sleep(1000 * (attempt + 1))
      }
    }
  })
}

async function getBalanceSubscan(account) {
  let total = 0
  for (const host of subscanHosts) {
    const data = await subscanPost(host, account)
    total += +(data?.data?.account?.balance ?? 0)
  }
  return total
}

// ---- combine -------------------------------------------------------------------------------

async function getBalance(account) {
  const sources = [...shuffle([getBalanceRpc, getBalanceSidecar]), getBalanceSubscan]
  let lastError
  for (const source of sources) {
    try {
      return await source(account)
    } catch (e) {
      lastError = e
      sdk.log(`polkadot: ${source.name} failed for ${account}, trying next source: ${e.message}`)
    }
  }
  throw lastError
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
