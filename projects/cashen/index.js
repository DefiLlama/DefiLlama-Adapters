const { get } = require('../helper/http')

const TVL_URL = 'https://api.cctools.network/api/markets/cashen/tvl'
const FETCH_OPTS = { headers: { 'User-Agent': 'DefiLlama-Adapter (cashen)' } }

// Canton Scan takes a holdings snapshot every 3h. CCTools refuses a snapshot over 6h old
// and answers 503 once its own read is over 2h old, so a fresh feed is at most ~8h behind;
// this only catches a feed that stopped advancing.
const MAX_SNAPSHOT_AGE_SECONDS = 12 * 60 * 60
// A snapshot time ahead of the clock is a fault, not a fresh read; allow 5 minutes of skew.
const MAX_CLOCK_SKEW_SECONDS = 5 * 60

async function tvl(api) {
  const feed = await get(TVL_URL, FETCH_OPTS)
  if (!feed || feed.asset !== 'CC')
    throw new Error('cashen: CCTools feed returned no CC total')
  if (!Number.isInteger(feed.party_count) || feed.party_count <= 0)
    throw new Error('cashen: CCTools feed counts no delegation parties')

  const ageSeconds = (Date.now() - new Date(feed.as_of).getTime()) / 1000
  if (!Number.isFinite(ageSeconds) || ageSeconds > MAX_SNAPSHOT_AGE_SECONDS)
    throw new Error(`cashen: CCTools feed is stale, as_of=${feed.as_of}`)
  if (ageSeconds < -MAX_CLOCK_SKEW_SECONDS)
    throw new Error(`cashen: CCTools feed snapshot is in the future, as_of=${feed.as_of}`)

  // total_cc is a decimal string in whole CC; do not scale it again.
  // null/'' convert to 0 under Number(), so reject them explicitly.
  if (typeof feed.total_cc !== 'string' || feed.total_cc === '')
    throw new Error('cashen: missing total_cc')
  // CCTools never publishes a zero total (it answers 503 instead), so a zero here is a fault.
  const total = Number(feed.total_cc)
  if (!Number.isFinite(total) || total <= 0)
    throw new Error(`cashen: invalid total_cc ${feed.total_cc}`)

  api.addCGToken('canton-network', total)
}

module.exports = {
  timetravel: false,
  methodology:
    'Counts the CC held in the dedicated party of each active Cashen delegation. ' +
    'Suppliers commit CC in one segregated party per lock, as Featured App locks work under CIP-0116, for Featured Apps and Super Validators that need locked CC, and earn a fixed yield. ' +
    'Cashen publishes the list of active delegation parties; balances are read from Canton Scan through the CCTools API.',
  canton: { tvl },
}
