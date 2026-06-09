const { get } = require('../helper/http')

// Hypemarket public TVL feed. Enumerates every live market (each market is its own
// on-chain object) and sums each market's on-chain `collateral_amount` — the LS-LMSR
// collateral backing pool — grouped by collateral token.
// NOTE: BASE_PATH defaults to /api in the backend. Confirm whether your reverse
// proxy keeps the /api prefix on api.hypemarket.trade and adjust if it strips it.
const TVL_URL = 'https://api.hypemarket.trade/api/defillama/tvl'

// Fallback CoinGecko ids if the API ever omits `coingeckoId` for a known symbol.
const SYMBOL_TO_CG = {
  USDC: 'usd-coin',
  USDT: 'tether',
  SUPRA: 'supra',
}

async function tvl(api) {
  const res = await get(TVL_URL)
  // The API wraps its payload in { data, success }; tolerate both that and a bare body.
  const payload = res && res.data ? res.data : res
  const tokens = Array.isArray(payload.tokens) ? payload.tokens : []
  for (const t of tokens) {
    const cgId = t.coingeckoId || SYMBOL_TO_CG[String(t.symbol || '').toUpperCase()]
    if (!cgId) continue // unpriceable collateral — skip rather than mis-value
    const amount = Number(t.amount)
    if (!Number.isFinite(amount) || amount <= 0) continue // skip missing/NaN/non-positive amounts
    // `amount` is whole tokens (rawAmount / 10**decimals); addCGToken prices by CoinGecko id.
    api.addCGToken(cgId, amount)
  }
}

module.exports = {
  timetravel: false, // API serves current TVL only; no historical backfill
  methodology:
    'TVL is the total collateral locked across all live HypeMarket prediction markets — ' +
    'the LS-LMSR backing pool securing outstanding outcome tokens. Each market is its own ' +
    'on-chain object; markets are enumerated from the market factory and each market\'s ' +
    'on-chain collateral_amount is summed, grouped by collateral token (SUPRA). ' +
    'Collateral that has been redeemed or refunded out of resolved/voided markets is excluded.',
  supra: {
    tvl,
  },
}
