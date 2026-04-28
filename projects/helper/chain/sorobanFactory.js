/**
 * Soroban Factory Walk — generic TVL helper for Soroban DEX factories.
 *
 * Two enumeration patterns found across Soroban DEXs are supported:
 *
 *   vec-style (Phoenix):
 *     factory.query_pools()  →  Vec<Address>
 *
 *   v2-style (Soroswap, Uniswap-V2-derived):
 *     factory.all_pairs_length()  →  u32
 *     factory.all_pairs(i: u32)   →  Address   (repeated for i in 0..n)
 *
 * Pool TVL is resolved via stellar.expert's contract balance endpoint, which
 * prices all tokens held by a contract in USD — the same source used by the
 * native stellarx and soroswap adapters.
 */

'use strict'

const { callSoroban } = require('./stellar')
const axios = require('axios')

const STELLAR_EXPERT_BASE = 'https://api.stellar.expert/explorer/public/contract'

/**
 * Fetch the USD value of all tokens held by a Soroban contract.
 * Uses axios directly (same as stellarx/soroswap) — DeFiLlama's get() helper
 * adds SDK interceptors that interfere with stellar.expert's response encoding.
 * Returns 0 on any network error so one bad pool never breaks the whole adapter.
 * @param {string} poolAddr - Stellar contract address (C...)
 * @returns {Promise<number>} USD value (float)
 */
async function _poolUsd(poolAddr) {
  try {
    const { data } = await axios.get(`${STELLAR_EXPERT_BASE}/${poolAddr}/value`)
    return data?.total > 0 ? data.total / 1e7 : 0
  } catch {
    return 0
  }
}

/**
 * Walk a Soroban factory contract and accumulate pool TVL into the adapter API.
 *
 * @param {object} api            DeFiLlama adapter API instance
 * @param {string} factoryAddr    Factory Stellar contract address (C...)
 * @param {object} [opts]
 * @param {'vec'|'v2'} [opts.style='vec']
 *   Enumeration pattern:
 *     'vec' — one call returns Vec<Address> of all pools (Phoenix style)
 *     'v2'  — length + indexed lookup pagination (Soroswap / Uniswap-V2 style)
 * @param {string} [opts.queryFn='query_pools']
 *   vec-style: contract function returning Vec<Address>
 * @param {string} [opts.lengthFn='all_pairs_length']
 *   v2-style: contract function returning total pair count (u32)
 * @param {string} [opts.pairFn='all_pairs']
 *   v2-style: contract function returning Address for a given index (u32)
 */
async function sorobanFactoryTvl(api, factoryAddr, opts = {}) {
  const {
    style = 'vec',
    queryFn = 'query_pools',
    lengthFn = 'all_pairs_length',
    pairFn = 'all_pairs',
  } = opts

  let pools

  if (style === 'vec') {
    pools = await callSoroban(factoryAddr, queryFn, [])
    if (!Array.isArray(pools) || pools.length === 0) {
      throw new Error(`sorobanFactoryTvl: ${queryFn}() returned empty or non-array`)
    }
  } else {
    // v2 style: enumerate by index
    const n = Number(await callSoroban(factoryAddr, lengthFn, []))
    if (n === 0) return
    pools = await Promise.all(
      Array.from({ length: n }, (_, i) => callSoroban(factoryAddr, pairFn, [i]))
    )
  }

  const values = await Promise.all(pools.map(_poolUsd))
  values.forEach(v => { if (v > 0) api.addUSDValue(v) })
}

module.exports = { sorobanFactoryTvl }
