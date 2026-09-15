const sdk = require('@defillama/sdk')
const bs58 = require('bs58').default
const { blake2b } = require('blakejs')
const { get, post } = require('../http')
const { sleep } = require('../utils')
const { getEnv } = require('../env')

// Polkadot moved account balances off the relay chain onto Asset Hub, so the relay
// chain now reports 0 for accounts that still hold DOT. Query both and take the sum
// so this keeps working either side of the migration.
//
// Three independent sources, tried in this order:
//   1. public JSON-RPC nodes (state_getStorage on System.Account) - keyless, no observed throttling,
//      node picked at random per call so no single node is hammered
//   2. Parity's public Sidecar - keyless, but the relay-chain instance 429s under ~5 concurrent calls
//   3. Subscan - 2 req/s per key and the key is shared by every CEX adapter in the run, so it 429s under load
// RPC and Sidecar are shuffled per call so load alternates between them; Subscan is always last.

const DOT_DECIMALS = 1e10

const rpcNodes = {
  relay: ['https://rpc.polkadot.io', 'https://polkadot.api.onfinality.io/public', 'https://polkadot-rpc.publicnode.com', 'https://dot-rpc.stakeworld.io'],
  assetHub: ['https://polkadot-asset-hub-rpc.polkadot.io', 'https://statemint.api.onfinality.io/public'],
}

const sidecarHosts = ['polkadot-public-sidecar', 'polkadot-asset-hub-public-sidecar']
const sidecarUrl = (host, account) => `https://${host}.parity-chains.parity.io/accounts/${account}/balance-info`

const subscanHosts = ['assethub-polkadot', 'polkadot']
const subscanUrl = host => `https://${host}.api.subscan.io/api/v2/scan/search`

const shuffle = (arr) => arr.map(v => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(([, v]) => v)

// ---- 1. raw storage read -------------------------------------------------------------------

// twox128("System") ++ twox128("Account"), constant for every substrate chain using frame_system
const SYSTEM_ACCOUNT_PREFIX = '26aa394eea5630e07c48ae0c9558cef7b99d880ec681799c0cf30e8886371da9'

// ss58 -> 32 byte account id (1 byte network prefix for prefixes < 64, 2 byte checksum)
function accountIdHex(address) {
  const bytes = bs58.decode(address)
  const prefixLen = bytes[0] < 64 ? 1 : 2
  return Buffer.from(bytes.slice(prefixLen, bytes.length - 2)).toString('hex')
}

// blake2_128concat(accountId) is the hasher for System.Account
function systemAccountKey(address) {
  const idHex = accountIdHex(address)
  const hash = Buffer.from(blake2b(Buffer.from(idHex, 'hex'), undefined, 16)).toString('hex')
  return '0x' + SYSTEM_ACCOUNT_PREFIX + hash + idHex
}

// AccountInfo: nonce u32, consumers u32, providers u32, sufficients u32, data { free u128, reserved u128, frozen u128, flags u128 }
function decodeAccountInfo(hex) {
  if (!hex) return 0
  const buf = Buffer.from(hex.replace(/^0x/, ''), 'hex')
  const u128 = (offset) => buf.subarray(offset, offset + 16).reduce((acc, b, i) => acc + BigInt(b) * (1n << BigInt(8 * i)), 0n)
  const free = u128(16)
  const reserved = u128(32)
  return Number(free + reserved) / DOT_DECIMALS
}

async function rpcStorage(nodes, key) {
  let lastError
  for (const url of shuffle(nodes)) {
    try {
      const res = await post(url, { jsonrpc: '2.0', id: 1, method: 'state_getStorage', params: [key] })
      if (res.error) throw new Error(`${url}: ${res.error.message}`)
      return res.result
    } catch (e) {
      lastError = e
    }
  }
  throw lastError
}

async function getBalanceRpc(account) {
  const key = systemAccountKey(account)
  let total = 0
  for (const nodes of Object.values(rpcNodes)) {
    total += decodeAccountInfo(await rpcStorage(nodes, key))
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
