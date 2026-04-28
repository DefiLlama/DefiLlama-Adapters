/**
 * Soroswap — Soroban DEX TVL adapter
 *
 * Pool list is enumerated live from the Soroswap factory contract via
 * sorobanFactoryTvl (v2/Uniswap-style: all_pairs_length + all_pairs(i)).
 * This replaces a hardcoded 25-pool list and now covers all factory-deployed
 * pairs (194+ as of 2026-04).
 *
 * Soroswap factory (mainnet): CA4HEQTL2WPEUYKYKCDOHCDNIV4QHNJ7EL4J4NQ6VADP7SYHVRYZ7AW2
 * Source: https://github.com/soroswap/core
 */

'use strict'

const { sorobanFactoryTvl } = require('../helper/chain/sorobanFactory')

const SOROSWAP_FACTORY = 'CA4HEQTL2WPEUYKYKCDOHCDNIV4QHNJ7EL4J4NQ6VADP7SYHVRYZ7AW2'

/**
 * @param {object} api - DeFiLlama adapter API
 */
async function tvl(api) {
  await sorobanFactoryTvl(api, SOROSWAP_FACTORY, {
    style: 'v2',
    lengthFn: 'all_pairs_length',
    pairFn: 'all_pairs',
  })
}

module.exports = {
  misrepresentedTokens: true,
  stellar: { tvl },
}
