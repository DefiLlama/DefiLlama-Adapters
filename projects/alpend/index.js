const { get } = require('../helper/http')

const TVL_URL = 'https://api.cctools.network/api/markets/alpend/tvl'
const FETCH_OPTS = { headers: { 'User-Agent': 'DefiLlama-Adapter (alpend)' } }

// Alpend's own upstream (services/protocolStateStore.js) can legitimately go quiet for a while
// when nothing changes on-chain, so this is generous on purpose — it's only meant to catch a
// genuinely dead feed (CCTools stopped polling), not a normal quiet period.
const MAX_SOURCE_AGE_SECONDS = 24 * 60 * 60

function validateFeed(feed, caller) {
  if (!feed || !Array.isArray(feed.pools) || feed.pools.length === 0)
    throw new Error(`alpend: CCTools feed returned no pools (${caller})`)
  if (feed.amountsAreScaled !== true)
    throw new Error(`alpend: CCTools feed amounts are not scaled (${caller})`)

  const ageSeconds = Number.isFinite(feed.sourceAgeSeconds)
    ? feed.sourceAgeSeconds
    : (Date.now() - new Date(feed.sourceUpdatedAt).getTime()) / 1000
  if (!Number.isFinite(ageSeconds) || ageSeconds > MAX_SOURCE_AGE_SECONDS)
    throw new Error(`alpend: CCTools feed is stale (${caller}), age=${ageSeconds}s`)
}

async function tvl(api) {
  const feed = await get(TVL_URL, FETCH_OPTS)
  validateFeed(feed, 'tvl')

  for (const pool of feed.pools) {
    if (!pool.coingeckoId)
      throw new Error(`alpend: no coingecko id for ${pool.asset}`)

    // Amounts are already decimal-adjusted; do not scale them again.
    // null/'' convert to 0 under Number(), which would silently report unavailable data as a
    // real zero balance — reject them explicitly rather than relying on the NaN check alone.
    if (pool.totalSupplied === null || pool.totalSupplied === '')
      throw new Error(`alpend: missing totalSupplied amount for ${pool.asset}`)
    const totalSupplied = Number(pool.totalSupplied)
    if (!Number.isFinite(totalSupplied) || totalSupplied < 0)
      throw new Error(`alpend: invalid totalSupplied amount for ${pool.asset}`)

    api.addCGToken(pool.coingeckoId, totalSupplied)
  }
}

async function borrowed(api) {
  const feed = await get(TVL_URL, FETCH_OPTS)
  validateFeed(feed, 'borrowed')

  for (const pool of feed.pools) {
    if (!pool.coingeckoId)
      throw new Error(`alpend: no coingecko id for ${pool.asset}`)

    if (pool.totalBorrowed === null || pool.totalBorrowed === '')
      throw new Error(`alpend: missing totalBorrowed amount for ${pool.asset}`)
    const totalBorrowed = Number(pool.totalBorrowed)
    if (!Number.isFinite(totalBorrowed) || totalBorrowed < 0)
      throw new Error(`alpend: invalid totalBorrowed amount for ${pool.asset}`)

    api.addCGToken(pool.coingeckoId, totalBorrowed)
  }
}

module.exports = {
  timetravel: false,
  methodology:
    'Alpend is a lending protocol on the Canton Network. Users supply CC, USDCx, and CBTC as collateral to earn yield, ' +
    'and borrow against that collateral; interest accrues on-chain via reserve indices. ' +
    'TVL is the gross amount of each asset supplied to Alpend\'s lending pools; the borrowed tab is the gross amount currently borrowed out of those pools. ' +
    'Balances are read from the CCTools API, a third-party Canton data aggregator that normalizes per-asset balances with canonical Canton instrument and CoinGecko IDs.',
  canton: { tvl, borrowed },
}
