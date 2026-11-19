const { getExports } = require('../helper/heroku-api')

// balances are computed by ./api.js in the custom-scripts runner (bulky group) and read back from elastic
module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: 'Sums the reserves of every AMM pool on the XRP Ledger (XLS-30), read with amm_info at one validated ledger by a scheduled job. XRP and RLUSD are priced directly, and a pool with one priced asset counts that side twice. Other tokens are converted at the price of their deepest pool against XRP or RLUSD, capped as in other DEX adapters. Order-book offers are not counted: offer funds stay in the owner account and are not locked.',
  ...getExports('xrpl-dex', ['ripple']),
}
