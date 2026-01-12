const { get } = require('../helper/http')

const API_URL = 'https://app.usenest.xyz/api/blaze/pools/aggregated-tvl-history'

async function tvl(api) {
  // Get current date and date from 24 hours ago
  const now = new Date()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  
  const from = yesterday.toISOString()
  const to = now.toISOString()
  
  const url = `${API_URL}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&intervalSeconds=86400`
  const data = await get(url)
  
  // Get the latest entry (last item in array)
  if (!Array.isArray(data) || data.length === 0) {
    return {}
  }
  
  const latestEntry = data[data.length - 1]
  const tvlValue = latestEntry.value || 0
  
  return api.addUSDValue(tvlValue)
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: 'TVL is fetched from the Nest Platform API aggregated TVL history endpoint.',
  hyperliquid: {
    tvl
  }
}
