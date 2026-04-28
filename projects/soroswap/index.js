/**
 * Soroswap — Soroban DEX TVL adapter
 */

'use strict'

const { sorobanFactoryTvl } = require('../helper/chain/sorobanFactory')

const SOROSWAP_FACTORY = 'CA4HEQTL2WPEUYKYKCDOHCDNIV4QHNJ7EL4J4NQ6VADP7SYHVRYZ7AW2'

async function tvl(api) {
  await sorobanFactoryTvl(api, SOROSWAP_FACTORY, {
    style: 'v2',
    lengthFn: 'all_pairs_length',
    pairFn: 'all_pairs',
  })
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  stellar: { tvl },
}
