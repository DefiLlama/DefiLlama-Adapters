const { get } = require('../helper/http')

const POOLS_URL = 'https://api.cctools.network/api/markets/send/pools'

// CCTools rejects axios's default User-Agent; identify ourselves explicitly.
const FETCH_OPTS = { headers: { 'User-Agent': 'DefiLlama-Adapter (pool-party)' } }

async function tvl(api) {
  const pools = await get(POOLS_URL, FETCH_OPTS)
  for (const pool of pools) {
    if (pool.status !== 'live') continue
    for (const side of [pool.baseReserve, pool.quoteReserve]) {
      if (side.coingeckoId) {
        api.addCGToken(side.coingeckoId, Number(side.amount))
      }
    }
  }
}

module.exports = {
  timetravel: false,
  canton: { tvl },
  methodology:
    "Sum of raw token reserves across Pool Party's live pools, via the " +
    "CCTools API — an independent Canton DeFi aggregator that exposes " +
    "per-pool reserves with canonical token IDs and CoinGecko slugs. The " +
    "CoinGecko slug per token comes from the API response " +
    "(reserve.coingeckoId), so new pools and tokens are picked up " +
    "automatically without adapter changes.",
}
