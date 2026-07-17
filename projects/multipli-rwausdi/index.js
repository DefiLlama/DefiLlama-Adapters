'use strict'

const CONFIG = require('./config')
const { calculateSupply } = require('./accounting')

for (const [chain, config] of Object.entries(CONFIG)) {
  module.exports[chain] = { tvl: api => calculateSupply(api, config) }
}

module.exports.methodology = {
  TVL:
    'rwaUSDi is calculated from official primary token totalSupply on ' +
    'Ethereum, Base, Monad and Arbitrum, minus only documented balances that ' +
    'do not represent an independent circulating claim. The Base AFI wrapper ' +
    'is not added as a second issuance layer. DefiLlama should price the token ' +
    'using the live Chainlink NAV feed. Chainlink Proof of Reserve, AFI and ' +
    'Chainrisk are verification evidence and are not added as extra TVL.',
}
