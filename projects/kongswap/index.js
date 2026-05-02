const { get } = require('../helper/http')

module.exports = {
  misrepresentedTokens: true,
  icp: { tvl },
}

async function tvl(api) {
  let { total_tvl } = await get('https://api2.kongswap.io/pools/totals')
  api.addCGToken('tether', Math.round(total_tvl))
}
