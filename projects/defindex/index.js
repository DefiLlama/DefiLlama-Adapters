const { get } = require('../helper/http')

const DEFINDEX_API_BASE_URL = 'https://api.defindex.io'
const DAY_ONE = 1748518054

// The DefiLlama HTTP helper does not retry on errors. Wrap it so transient
// failures (rate limits, network blips, cold-start hiccups) don't translate
// into a missing data point on the chart. Backoff: 1s, 2s, 4s, 8s.
async function getWithRetry(url, retries = 3) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await get(url)
    } catch (e) {
      if (attempt === retries) throw e
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)))
    }
  }
}

async function tvl(api) {
  const url = api.timestamp
    ? `${DEFINDEX_API_BASE_URL}/tvl?timestamp=${api.timestamp}`
    : `${DEFINDEX_API_BASE_URL}/tvl`
  try {
    const data = await getWithRetry(url)
    for (const [assetId, amount] of Object.entries(data.tvl)) {
      api.add(assetId, amount)
    }
  } catch (error) {
    console.error('Error fetching DeFindex TVL:', error)
  }
}

module.exports = {
  timetravel: true,
  start: DAY_ONE,
  methodology: 'TVL is the sum of all assets managed by DeFindex vaults on Stellar, reconstructed from on-chain indexed events.',
  stellar: { tvl },
}
