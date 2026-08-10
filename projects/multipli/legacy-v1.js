'use strict'

// The KYB V1 cohort's balances sit in off-chain custody and cannot be read
// on-chain. This endpoint reports only the funds that have not migrated to
// the V2 vaults, so what it returns never overlaps the on-chain V2 figures.
const API = 'https://api.multipli.fi/4626/main/vaults/v1/defillama/tvl-non-migrated/'

let payloadPromise

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function normalizeInteger(value, label) {
  let normalized
  if (typeof value === 'string') normalized = value
  else if (typeof value === 'number' && Number.isSafeInteger(value))
    normalized = String(value)
  else throw new Error(`Multipli V1: invalid balance for ${label}`)

  if (!/^\d+$/.test(normalized))
    throw new Error(`Multipli V1: invalid balance for ${label}`)

  return normalized.replace(/^0+(?=\d)/, '')
}

function addressSet(addresses, label) {
  return new Set(
    (addresses || []).map(address => {
      if (!/^0x[a-fA-F0-9]{40}$/.test(address))
        throw new Error(`Multipli V1: invalid ${label} address ${address}`)
      return address.toLowerCase()
    })
  )
}

function hasFunds(balances) {
  if (!isPlainObject(balances)) return false
  return Object.values(balances).some(
    value => /^\d+$/.test(String(value)) && BigInt(String(value)) > 0n
  )
}

// Only chains with v1.enabled are queried, so a chain that starts reporting
// non-migrated funds without a registry entry would drop out of TVL unnoticed.
function assertChainsCovered(payload) {
  // Lazy require avoids a load-order dependency between the two modules.
  const { chains } = require('./config')
  for (const [chain, balances] of Object.entries(payload)) {
    if (!hasFunds(balances)) continue
    const v1 = chains[chain] && chains[chain].v1
    if (!v1 || !v1.enabled)
      throw new Error(
        `Multipli V1: ${chain} reports non-migrated funds but is not enabled; update registry first`
      )
  }
}

async function fetchPayload() {
  if (!payloadPromise) {
    // Lazy require keeps the validation helpers independently testable.
    const { get } = require('../helper/http')
    payloadPromise = get(API, {
      timeout: 15_000,
      headers: { accept: 'application/json' },
    })
      .then(data => {
        if (
          !isPlainObject(data) ||
          !isPlainObject(data.payload) ||
          !isPlainObject(data.payload.tvl_data)
        )
          throw new Error('Multipli V1: malformed API response')
        assertChainsCovered(data.payload.tvl_data)
        return data.payload.tvl_data
      })
      .catch(error => {
        payloadPromise = undefined
        throw error
      })
  }
  return payloadPromise
}

function sanitizeChainBalances(chain, rawBalances, v1Config, blockedAssets) {
  if (!isPlainObject(rawBalances))
    throw new Error(`Multipli V1: malformed ${chain} balances`)

  const allowed = addressSet(v1Config.allowedAssets, 'allowed')
  const blocked = addressSet(blockedAssets, 'blocked')
  const result = {}

  for (const [rawKey, rawValue] of Object.entries(rawBalances)) {
    // The API keys balances by bare token address; older payloads prefixed
    // them with the chain, so both forms are accepted.
    const match = rawKey.match(/^(?:([a-z0-9-]+):)?(0x[a-fA-F0-9]{40})$/)
    if (!match) throw new Error(`Multipli V1: invalid key ${rawKey}`)

    const [, keyChain, address] = match
    if (keyChain && keyChain !== chain)
      throw new Error(`Multipli V1: ${rawKey} returned for ${chain}`)

    const normalizedAddress = address.toLowerCase()
    if (blocked.has(normalizedAddress)) continue
    if (!allowed.has(normalizedAddress))
      throw new Error(
        `Multipli V1: unapproved ${chain} asset ${address}; update registry first`
      )

    const key = `${chain}:${normalizedAddress}`
    result[key] = normalizeInteger(rawValue, key)
  }

  return result
}

async function getLegacyBalances(chain, v1Config, blockedAssets) {
  const payload = await fetchPayload()
  return sanitizeChainBalances(
    chain,
    payload[chain] || {},
    v1Config,
    blockedAssets
  )
}

function resetCacheForTests() {
  payloadPromise = undefined
}

module.exports = {
  API,
  assertChainsCovered,
  getLegacyBalances,
  normalizeInteger,
  resetCacheForTests,
  sanitizeChainBalances,
}
