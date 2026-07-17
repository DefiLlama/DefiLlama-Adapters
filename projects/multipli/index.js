'use strict'

const { chains } = require('./config')
const { calculateTvl } = require('./accounting')
const { getLegacyBalances } = require('./legacy-v1')

for (const [chain, config] of Object.entries(chains)) {
  module.exports[chain] = {
    tvl: api => calculateTvl(api, config, getLegacyBalances),
  }
}

// V1 is a current-state endpoint until the remaining cohort is migrated.
module.exports.timetravel = false

module.exports.methodology = {
  TVL:
    'Multipli Yield TVL equals disjoint legacy V1 balances plus V2 vault ' +
    'totalAssets. V2 is calculated onchain from a fixed vault registry after ' +
    'validating asset() against the expected underlying. Legacy V1 is included ' +
    'only on Ethereum and BNB Chain through the existing Multipli DefiLlama ' +
    'endpoint, with strict chain and asset allowlists and explicit rwaUSDi ' +
    'exclusion. V1 and V2 are non-overlapping cohorts. xToken share supply is ' +
    'not added. rwaUSDi is reported as a separate child protocol.',
}
