/**
 * Beets (Beethoven X) — Sonic TVL adapter
 *
 * Beets is a Balancer V2 fork deployed on Sonic mainnet.
 * Uses the canonical Balancer vault address deployed at block 368,328.
 * onChainTvl enumerates all registered pools via PoolRegistered events.
 *
 * Vault: 0xBA12222222228d8Ba445958a75a0704d566BF2C8
 */

'use strict'

const { onChainTvl } = require('../helper/balancer')

module.exports = {
  timetravel: false,
  sonic: {
    tvl: onChainTvl('0xBA12222222228d8Ba445958a75a0704d566BF2C8', 368328),
  },
}
