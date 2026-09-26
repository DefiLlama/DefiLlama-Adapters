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

async function getPools(caller) {
  const feed = await get(TVL_URL, FETCH_OPTS)
  validateFeed(feed, caller)
  for (const pool of feed.pools)
    if (!pool.coingeckoId)
      throw new Error(`alpend: no coingecko id for ${pool.asset}`)
  return feed.pools
}

// Amounts are already decimal-adjusted; do not scale them again.
// null/'' convert to 0 under Number(), which would silently report unavailable data as a
// real zero balance — reject them explicitly rather than relying on the NaN check alone.
function getAmount(pool, field) {
  if (pool[field] === null || pool[field] === undefined || pool[field] === '')
    throw new Error(`alpend: missing ${field} amount for ${pool.asset}`)
  const amount = Number(pool[field])
  if (!Number.isFinite(amount) || amount < 0)
    throw new Error(`alpend: invalid ${field} amount for ${pool.asset}`)
  return amount
}

async function tvl(api) {
  for (const pool of await getPools('tvl')) {
    // Supplied assets that are lent out leave the pool and are reported under borrowed.
    const available = getAmount(pool, 'totalSupplied') - getAmount(pool, 'totalBorrowed')
    if (available < 0)
      throw new Error(`alpend: borrowed exceeds supplied for ${pool.asset}`)
    api.addCGToken(pool.coingeckoId, available)
  }
}

async function borrowed(api) {
  for (const pool of await getPools('borrowed'))
    api.addCGToken(pool.coingeckoId, getAmount(pool, 'totalBorrowed'))
}

module.exports = {
  timetravel: false,
  methodology:
    'Alpend is a lending protocol on the Canton Network. Users supply CC, USDCx, and CBTC as collateral to earn yield, ' +
    'and borrow against that collateral; interest accrues on-chain via reserve indices. ' +
    'TVL is the amount of each asset supplied to Alpend\'s lending pools minus the amount borrowed out of them, i.e. the assets held by the pool operator party; ' +
    'the borrowed tab is the gross amount currently borrowed out of those pools. ' +
    'Balances are read from the CCTools API, a third-party Canton data aggregator that normalizes per-asset balances with canonical Canton instrument and CoinGecko IDs.',
  canton: { tvl, borrowed },
}
