'use strict'

const API =
  'https://api.multipli.fi/multipli/v1/external-aggregator/defillama/tvl/'

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

async function fetchPayload() {
  if (!payloadPromise) {
    // Lazy require keeps the validation helpers independently testable.
    const axios = require('axios')
    payloadPromise = axios
      .get(API, {
        timeout: 15_000,
        headers: { accept: 'application/json' },
      })
      .then(({ data }) => {
        if (!isPlainObject(data) || !isPlainObject(data.payload))
          throw new Error('Multipli V1: malformed API response')
        return data.payload
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
    const match = rawKey.match(/^([a-z0-9-]+):(0x[a-fA-F0-9]{40})$/)
    if (!match) throw new Error(`Multipli V1: invalid key ${rawKey}`)

    const [, keyChain, address] = match
    if (keyChain !== chain)
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
  getLegacyBalances,
  normalizeInteger,
  resetCacheForTests,
  sanitizeChainBalances,
}
