const { customScriptTvlExports } = require('../helper/utils')

// TVL is computed by the custom script projects/helper/custom-scripts/xrpl-dex/index.js (Jenkins job tvl-custom-scripts/xrpl-dex)
// and read from the custom-scripts log; a run older than 24 hours is not used.
module.exports = {
  ...customScriptTvlExports({ ripple: 'xrpl-dex' }),
  misrepresentedTokens: true,
  methodology: 'Sums the reserves of every AMM pool on the XRP Ledger (XLS-30), read with amm_info at one validated ledger by a scheduled job. XRP and RLUSD are priced directly; a pool with one priced asset counts that side twice; other tokens are converted at the price of their deepest pool against XRP or RLUSD, capped as in other DEX adapters. Order-book offers are not counted: offer funds stay in the owner account and are not locked.',
}
