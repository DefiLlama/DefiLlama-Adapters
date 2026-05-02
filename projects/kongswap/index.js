const { get } = require('../helper/http')

module.exports = {
  misrepresentedTokens: true,
  icp: { tvl },
  deadFrom: '2026-04-06',  // project is sunset: https://x.com/KongSwapX/status/2037472225687744664
}

async function tvl(api) {
  let { total_tvl } = await get('https://api.kongswap.io/api/pools/totals')
  api.addCGToken('tether', Math.round(total_tvl))
}
