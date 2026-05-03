/**
 * Soroban Factory Walk — generic TVL helper for Soroban DEX factories.
 */

'use strict'

const { callSoroban } = require('./stellar')
const axios = require('axios')

const STELLAR_EXPERT_BASE = 'https://api.stellar.expert/explorer/public/contract'

/**
 * Fetch the USD value of all tokens held by a Soroban contract.
 * Returns null on failure to distinguish from genuine zero.
 */
async function _poolUsd(poolAddr) {
  try {
    const { data } = await axios.get(`${STELLAR_EXPERT_BASE}/${poolAddr}/value`)
    return data?.total >= 0 ? data.total / 1e7 : 0
  } catch (err) {
    console.error(`[sorobanFactory] Failed to fetch value for ${poolAddr}: ${err.message}`)
    return null 
  }
}

/**
 * Walk a Soroban factory contract and accumulate pool TVL.
 */
async function sorobanFactoryTvl(api, factoryAddr, opts = {}) {
  const {
    style = 'vec',
    queryFn = 'query_pools',
    lengthFn = 'all_pairs_length',
    pairFn = 'all_pairs',
    concurrency = 10,
  } = opts

  let pools

  if (style === 'vec') {
    pools = await callSoroban(factoryAddr, queryFn, [])
  } else if (style === 'v2') {
    const n = Number(await callSoroban(factoryAddr, lengthFn, []))
    if (n === 0) return
    pools = await Promise.all(
      Array.from({ length: n }, (_, i) => callSoroban(factoryAddr, pairFn, [i]))
    )
  } else {
    throw new Error(`sorobanFactoryTvl: Unknown style "${style}". Expected "vec" or "v2".`)
  }

  if (!Array.isArray(pools) || pools.length === 0) {
    console.warn(`[sorobanFactory] No pools found for factory ${factoryAddr}`)
    return
  }

  // Simple concurrency-limited pool value fetching
  for (let i = 0; i < pools.length; i += concurrency) {
    const batch = pools.slice(i, i + concurrency)
    const values = await Promise.all(batch.map(_poolUsd))
    values.forEach(v => {
      if (v !== null && v > 0) api.addUSDValue(v)
    })
  }
}

module.exports = { sorobanFactoryTvl }
