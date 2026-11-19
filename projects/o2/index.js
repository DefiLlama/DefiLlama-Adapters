const { get } = require('../helper/http')

const STATS_URL = 'https://assets.o2.app/published/stats.json'
const MAX_AGE_MS = 6 * 60 * 60 * 1000

async function tvl(api) {
  const { generated_at, tvl } = await get(STATS_URL)
  const ageMs = Date.now() - new Date(generated_at).getTime()
  if (!(ageMs < MAX_AGE_MS)) throw new Error(`o2 stats are stale: generated_at=${generated_at}`)
  api.addUSDValue(tvl.total_usd)
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: 'The TVL is defined as the total sum of assets across all user trading accounts, as reported by the O2 stats API',
  fuel: { tvl },
}
