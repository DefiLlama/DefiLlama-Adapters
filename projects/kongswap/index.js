const { get } = require('../helper/http')

module.exports = {
  deadFrom: '2026-04-06',
  misrepresentedTokens: true,
  icp: { tvl },
}

async function tvl(api) {
  if (api.timestamp * 1000 > new Date('2026-04-06')) return {}

  let { total_tvl } = await get('https://api.kongswap.io/api/pools/totals')
  api.addCGToken('tether', Math.round(total_tvl))
}
