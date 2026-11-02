const { sumTokensExport } = require('../helper/sumTokens')

// SASEUL-side custody address holding the SL that backs SL bridged to Hyperliquid via Lubics
const LOCK_ADDRESS = '06e880ad8d3a9a062a9b31e39fd691bbe8cbd92a2b74'

module.exports = {
  timetravel: false,
  methodology: 'TVL is the native SL balance held in the Lubics bridge custody address on the SASEUL main chain, read directly from SASEUL public nodes.',
  saseul: {
    tvl: sumTokensExport({ owners: [LOCK_ADDRESS] }),
  },
}
