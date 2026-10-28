const { get } = require('../helper/http')

const POOLS_URL = 'https://api.cctools.network/api/markets/tradecraft/pools'

// CCTools rejects axios's default User-Agent; identify ourselves explicitly.
const FETCH_OPTS = { headers: { 'User-Agent': 'DefiLlama-Adapter (tradecraft)' } }

// Used only when CCTools returns no coingeckoId for a Canton instrument.
// Each id was matched to its Canton issuer via CoinGecko's canton-network platform entry.
const fallbackIds = {
  HANDL: 'handl-pay', // admin handl-issuer
  eXAU: 'ember-gold', // admin ember-gold
  eXAG: 'ember-silver', // admin ember-silver
}

async function tvl(api) {
  const pools = await get(POOLS_URL, FETCH_OPTS)
  if (!Array.isArray(pools) || pools.length === 0)
    throw new Error('tradecraft: CCTools returned no pools')

  for (const pool of pools) {
    if (pool.status !== 'live') continue
    for (const side of [pool.baseReserve, pool.quoteReserve]) {
      const symbol = side.symbol ?? side.id
      if (symbol === 'FRXUSD.B') continue // bridged variant, 1:1 with Frax USD not verified
      const id = side.coingeckoId || fallbackIds[symbol]
      if (!id) continue // token without a CoinGecko listing is excluded
      const amount = Number(side.amount)
      if (!Number.isFinite(amount) || amount < 0)
        throw new Error(`tradecraft: invalid reserve for ${symbol}`)
      api.addCGToken(id, amount)
    }
  }
}

module.exports = {
  timetravel: false,
  methodology:
    'Tradecraft is a liquidity layer and AMM on the Canton Network. TVL is the sum of the raw token reserves across its live pools, read from the CCTools API, an independent Canton DeFi aggregator that exposes per-pool reserves with canonical token IDs and CoinGecko slugs. Where CCTools has no CoinGecko slug for a Canton token, the slug is matched by hand to the token issuer via CoinGecko. Tokens without a CoinGecko listing, and bridged variants whose 1:1 backing could not be verified (FRXUSD.B), are excluded.',
  canton: { tvl },
}
