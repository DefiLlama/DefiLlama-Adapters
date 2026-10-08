const { getConfig } = require('../helper/cache')
const { get } = require('../helper/http')

// Morpho's own exclusion feed. Additive: unioned with the hardcoded lists in config.js, never a
// replacement - the feed is currently a strict subset of what we exclude by hand.
const BASE_URL = 'https://api.morpho.org/reporting/v1/exclusions'

// the feed is plain comma-separated with no quoting; reason is last, so any extra commas fold into it
function parseCsv(text) {
  const lines = String(text).trim().split('\n').filter(Boolean)
  if (lines.length < 2) return []
  const header = lines[0].split(',').map(h => h.trim())
  return lines.slice(1).map(line => {
    const parts = line.split(',')
    const row = {}
    header.forEach((h, i) => {
      row[h] = (i === header.length - 1 ? parts.slice(i).join(',') : parts[i] || '').trim()
    })
    return row
  })
}

async function getExclusions() {
  return getConfig('morpho-blue/exclusions', undefined, {
    fetcher: async () => {
      const [markets, assets, vaults] = await Promise.all(
        ['markets', 'assets', 'vaults'].map(f => get(`${BASE_URL}/${f}.csv`))
      )
      return { markets: parseCsv(markets), assets: parseCsv(assets), vaults: parseCsv(vaults) }
    },
  })
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
