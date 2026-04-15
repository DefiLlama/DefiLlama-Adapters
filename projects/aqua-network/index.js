const { get } = require('../helper/http')
const AQUA_STATS_URL = "https://amm-api.aqua.network/api/external/v1/statistics/totals/?size=all"

let _dataPromise = null

async function getData() {
  if (_dataPromise === null) {
    _dataPromise = get(AQUA_STATS_URL).catch((err) => {
      _dataPromise = null
      throw err
    })
  }

  const data = await _dataPromise
  return Array.isArray(data) ? data : data?.results ?? data?.data ?? []
}

function formatUtcDate(unixTimestamp) {
  return new Date(unixTimestamp * 1000).toISOString().slice(0, 10)
}

function pickClosestRow(rows, targetDate) {
  const sortedRows = rows
    .filter((row) => row?.date && row?.tvl != null)
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))

  const exactMatch = sortedRows.find((row) => row.date === targetDate)
  if (exactMatch) return exactMatch

  const priorRows = sortedRows.filter((row) => row.date < targetDate)
  if (priorRows.length) return priorRows[priorRows.length - 1]

  return sortedRows[0]
}

async function tvl(api) {
  const key = formatUtcDate(api.timestamp)
  const rows = await getData()
  const row = pickClosestRow(rows, key)

  if (!row) throw new Error('No Aquarius TVL rows returned by source API')

  api.addCGToken('tether', Number(row.tvl) / 1e7)
}

module.exports = {
  start: '2024-07-01',
  misrepresentedTokens: true,
  methodology:
    'counts the liquidity of the Pools on AMM, data is pulled from the Aquarius API.',
  stellar: { tvl },
};
