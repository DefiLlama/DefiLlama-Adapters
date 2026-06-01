const { get } = require('../helper/http')

const POOLS_URL = 'https://api.cctools.network/api/markets/send/pools'

// CCTools rejects axios's default User-Agent; identify ourselves explicitly.
const FETCH_OPTS = { headers: { 'User-Agent': 'DefiLlama-Adapter (pool-party)' } }

// Canonical Canton token IDs → CoinGecko slugs.
// USDCx (bridged USDC) and CUSD (Send privacy stable) priced as USDC; neither
// has its own CoinGecko listing.
const TOKEN_TO_CG = {
  'Amulet': 'canton-network',
  'USDCx': 'usd-coin',
  '481871d4-ca56-42a8-b2d3-4b7d28742946': 'usd-coin',
}

async function tvl(api) {
  const pools = await get(POOLS_URL, FETCH_OPTS)
  for (const pool of pools) {
    if (pool.status !== 'live') continue
    for (const side of [pool.baseReserve, pool.quoteReserve]) {
      const cgId = TOKEN_TO_CG[side.tokenId]
      if (cgId) api.addCGToken(cgId, Number(side.amount))
    }
  }
}

module.exports = {
  timetravel: false,
  canton: { tvl },
  methodology:
    "Sum of raw token reserves across Pool Party's live pools " +
    "(CC/USDCx, CC/CUSD, CUSD/USDCx), via the CCTools API — an independent " +
    "Canton DeFi aggregator that exposes per-pool reserves with canonical " +
    "token IDs. CC priced via coingecko:canton-network; USDCx (bridged USDC) " +
    "and CUSD priced via coingecko:usd-coin (neither has its own listing).",
}
