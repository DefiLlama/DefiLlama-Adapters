const { get } = require('../helper/http')

const TVL_URL = 'https://api.cctools.network/api/markets/alpend/tvl'
const FETCH_OPTS = { headers: { 'User-Agent': 'DefiLlama-Adapter (alpend)' } }

// Alpend's own upstream (services/protocolStateStore.js) can legitimately go quiet for a while
// when nothing changes on-chain, so this is generous on purpose — it's only meant to catch a
// genuinely dead feed (CCTools stopped polling), not a normal quiet period.
const MAX_SOURCE_AGE_SECONDS = 24 * 60 * 60

// CCTools aliases USDXLR's coingeckoId to usd-coin, which reports it as a USDC balance. coins
// prices it as canton:USDXLR off the Excellar reserve gate, so key these on the Canton instrument
// instead. Canton amounts are Daml Decimal (Numeric 10), so every instrument is scale 10 whatever
// its origin chain used; this must match coins/src/adapters/other/excellarUsdxlr.ts.
const CANTON_SCALE = 10
const CANTON_PRICED = new Set(['USDXLR'])

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
  // Newly listed assets can appear before CCTools maps a coingecko id and before coins prices the
  // instrument; skip them until one of the two can value them.
  return feed.pools.filter(pool => pool.coingeckoId || CANTON_PRICED.has(pool.tokenId))
}

// addCGToken keys on the coingecko id and takes a scaled amount; a Canton instrument is keyed on
// this chain and so wants base units.
function addPool(api, pool, amount) {
  if (CANTON_PRICED.has(pool.tokenId)) api.add(pool.tokenId, amount * 10 ** CANTON_SCALE)
  else api.addCGToken(pool.coingeckoId, amount)
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
    addPool(api, pool, available)
  }
}

async function borrowed(api) {
  for (const pool of await getPools('borrowed'))
    addPool(api, pool, getAmount(pool, 'totalBorrowed'))
}

module.exports = {
  timetravel: false,
  methodology:
    'Alpend is a lending protocol on the Canton Network. Users supply assets to its lending pools as collateral to earn yield, ' +
    'and borrow against that collateral; interest accrues on-chain via reserve indices. ' +
    'TVL is the amount of each asset supplied to Alpend\'s lending pools minus the amount borrowed out of them, i.e. the assets held by the pool operator party; ' +
    'the borrowed tab is the gross amount currently borrowed out of those pools. ' +
    'Balances are read from the CCTools API, a third-party Canton data aggregator that normalizes per-asset balances with canonical Canton instrument and CoinGecko IDs.',
  canton: { tvl, borrowed },
}
