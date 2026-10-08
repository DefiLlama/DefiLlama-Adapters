const sdk = require('@defillama/sdk')
const { getConfig } = require('../helper/cache')
const { get } = require('../helper/http')

// Morpho's own exclusion feed. Additive: unioned with the hardcoded lists in config.js, never a
// replacement - the feed is currently a strict subset of what we exclude by hand.
const BASE_URL = 'https://api.morpho.org/reporting/v1/exclusions'
// required columns per file: a response that does not carry them is not a CSV we understand,
// which is how an html error page served as 200 is told apart from a genuine header-only file
const KINDS = {
  markets: ['chain', 'market_id', 'effective_from', 'effective_to'],
  assets: ['chain', 'asset_address', 'effective_from', 'effective_to'],
  vaults: ['chain', 'vault_address', 'effective_from', 'effective_to'],
}

// the feed is plain comma-separated with no quoting; reason is last, so any extra commas fold into it.
// returns null when the header is missing the required columns, so the caller can keep the old cache
function parseCsv(text, requiredColumns) {
  const lines = String(text).trim().split('\n').filter(Boolean)
  if (!lines.length) return null
  const header = lines[0].split(',').map(h => h.trim())
  if (!requiredColumns.every(c => header.includes(c))) return null
  return lines.slice(1).map(line => {
    const parts = line.split(',')
    const row = {}
    header.forEach((h, i) => {
      row[h] = (i === header.length - 1 ? parts.slice(i).join(',') : parts[i] || '').trim()
    })
    return row
  })
}

// a header-only file is a valid empty list; a missing key means we never got a usable version of it
const isValidBundle = (bundle) => !!bundle && Object.keys(KINDS).every(k => Array.isArray(bundle[k]))

async function getExclusions() {
  const kinds = Object.keys(KINDS)
  const bundle = await getConfig('morpho-blue/exclusions', undefined, {
    fetcher: async () => {
      const files = await Promise.all(kinds.map(f => get(`${BASE_URL}/${f}.csv`)))
      const fetched = {}
      kinds.forEach((k, i) => {
        const rows = parseCsv(files[i], KINDS[k])
        if (rows) fetched[k] = rows
      })
      // a partial or malformed fetch must not overwrite the cache - getConfig keeps the last good copy
      if (!isValidBundle(fetched)) throw new Error('morpho exclusions: incomplete or malformed feed')
      return fetched
    },
  })
  if (!isValidBundle(bundle)) {
    sdk.log('morpho-blue: no valid exclusion feed and no cache, running without feed exclusions')
    return null
  }
  return bundle
}

// effective_from is inclusive, effective_to exclusive and empty while the exclusion is still active
const isActive = (row, dateString) =>
  (!row.effective_from || row.effective_from <= dateString) &&
  (!row.effective_to || row.effective_to > dateString)

const getDateString = (api) =>
  new Date((api.timestamp || Math.floor(Date.now() / 1e3)) * 1e3).toISOString().slice(0, 10)

async function getRows(api, kind) {
  const exclusions = await getExclusions()
  const rows = (exclusions && exclusions[kind]) || []
  const dateString = getDateString(api)
  return rows.filter(row => row.chain === api.chain && isActive(row, dateString))
}

const getExcludedMarketIds = async (api) => (await getRows(api, 'markets')).map(i => i.market_id.toLowerCase())
const getExcludedAssets = async (api) => (await getRows(api, 'assets')).map(i => i.asset_address.toLowerCase())
const getExcludedVaults = async (api) => (await getRows(api, 'vaults')).map(i => i.vault_address.toLowerCase())

module.exports = { getExcludedMarketIds, getExcludedAssets, getExcludedVaults }
