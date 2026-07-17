'use strict'

const CONFIG = require('./config')
const { calculateSupply } = require('./accounting')

for (const [chain, config] of Object.entries(CONFIG)) {
  module.exports[chain] = { tvl: api => calculateSupply(api, config) }
}

module.exports.methodology =
  'TVL is the total supply of rwaUSDi on Ethereum, Base, Monad and ' +
  'Arbitrum, priced at net asset value via the Chainlink NAV feed. Wrapped ' +
  'versions of the token (such as the AFI wrapper on Base) are not counted ' +
  'again, and reserve attestations like Chainlink Proof of Reserve are not ' +
  'added as extra TVL.'
