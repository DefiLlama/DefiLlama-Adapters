
const { get } = require('../helper/http')

module.exports = {
  misrepresentedTokens: true,
  icp: { tvl },
}

async function tvl(api) {
  let { tvlUSD } = await get('https://uvevg-iyaaa-aaaak-ac27q-cai.raw.ic0.app/overview')
  api.addCGToken('tether', Math.round(tvlUSD))
}
