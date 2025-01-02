const { get } = require('../helper/http')

module.exports = {
  misrepresentedTokens: true,
  icp: { tvl },
}

async function tvl(api) {
  let { tvlUSD } = await get('https://api.kongswap.io/api/defillama/tvl')
  api.addCGToken('tether', Math.round(tvlUSD))
}
