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

module.exports.methodology =
  'TVL is the underlying assets (USDC, USDT, BTC variants) held in Multipli ' +
  'V2 yield vaults, read on-chain via totalAssets(), plus legacy V1 user ' +
  'balances on Ethereum and BNB Chain that have not yet migrated, reported ' +
  'by the Multipli API. Nothing is counted twice: V1 and V2 balances never ' +
  'overlap, vault share tokens (xTokens) are excluded, and rwaUSDi is ' +
  'tracked separately under the Multipli rwaUSDi child protocol.'
