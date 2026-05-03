const { get } = require('../helper/http')

/*
 * Pool Party — Canton Network AMM
 *
 * v2 adapter — reads Pool Party's public v1 API on Send Foundation's
 * validator (Cloudflare Worker). Replaces the prior Lighthouse-only
 * implementation, which surfaced CC balances per party only and missed
 * the stablecoin sides of every pool (~99.9% of TVL).
 *
 * Upstream API:   https://api-mainnet.cantonwallet.com/canton/pool-party/public/v1
 * Spec issue:     https://github.com/0xsend/canton-monorepo/issues/3481
 * Snapshot cadence: 5 minutes
 * Auth:           none (public)
 */

const BASE_URL =
  'https://api-mainnet.cantonwallet.com/canton/pool-party/public/v1'

// Pool Party SDK instrument IDs are returned as keys on the /tvl response.
// Stable identifiers per Send Foundation:
//   - "Amulet"  : Canton Coin (CC)            — priced via coingecko:canton-network
//   - "USDCx"   : bridged USDC on Canton      — priced as USDC ($1 stable proxy)
//   - CUSD UUID : Send's privacy stablecoin   — priced as USDC ($1 stable proxy)
//
// CUSD has no CoinGecko listing yet; pricing as USDC matches the methodology
// used by other Canton stablecoin wrappers on DefiLlama. Brale issues multiple
// instruments (e.g. SBC) from the same party — only the CUSD UUID below is in
// scope; any other unknown instrument IDs are intentionally skipped.
const CUSD_INSTRUMENT_ID = '481871d4-ca56-42a8-b2d3-4b7d28742946'

async function tvl(api) {
  const data = await get(BASE_URL + '/tvl')
  const balances = (data && data.tvl) || {}

  for (const [instrumentId, amount] of Object.entries(balances)) {
    const value = Number(amount)
    if (!Number.isFinite(value) || value <= 0) continue

    if (instrumentId === 'Amulet') {
      // Canton Coin (gas token). DefiLlama's Canton pricing config uses
      // 18-decimal atomic units; matches the existing wcc adapter.
      api.addGasToken(value * 1e18)
    } else if (
      instrumentId === 'USDCx' ||
      instrumentId === CUSD_INSTRUMENT_ID
    ) {
      // USDCx (bridged USDC) and CUSD (Send privacy stable) priced as USDC ($1).
      // coingecko:usd-coin expects 6-decimal atomic units.
      api.add('coingecko:usd-coin', value * 1e6, { skipChain: true })
    }
    // Unknown instrument IDs (e.g. SBC) are intentionally skipped.
  }
}

module.exports = {
  timetravel: false,
  canton: { tvl },
  methodology:
    "TVL is the sum of Canton Coin (CC), CUSD, and USDCx balances held by " +
    "Pool Party, fetched from the public Pool Party API on Send Foundation's " +
    "validator (api-mainnet.cantonwallet.com). CC is priced via CoinGecko " +
    "(canton-network); CUSD (Send's privacy stablecoin) and USDCx (bridged " +
    "USDC on Canton) are priced as USDC ($1 stable proxy) since neither has " +
    "a CoinGecko listing. Refresh cadence: 5m. Replaces the previous " +
    "Lighthouse-based methodology, which exposed CC balances per party only.",
}
