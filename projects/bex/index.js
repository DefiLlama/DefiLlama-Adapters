/**
 * BEX — Berachain Exchange TVL adapter
 *
 * BEX is the native Balancer V2 fork deployed on Berachain mainnet.
 * Vault: 0x4be03f781c497a489e3cb0287833452ca9b9e80b (deployed block 9384)
 * onChainTvl enumerates all registered pools via PoolRegistered events.
 */

'use strict'

const { onChainTvl } = require('../helper/balancer')

module.exports = {
  timetravel: false,
  berachain: {
    tvl: onChainTvl('0x4be03f781c497a489e3cb0287833452ca9b9e80b', 9384),
  },
}
