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
  const rows = Array.isArray(data) ? data : data?.results ?? data?.data

  if (!Array.isArray(rows)) {
    _dataPromise = null
    throw new Error(`Unexpected Aquarius API response shape: ${JSON.stringify(data).slice(0, 500)}`)
  }

  return rows
}

function formatUtcDate(unixTimestamp) {
  return new Date(unixTimestamp * 1000).toISOString().slice(0, 10)
}

async function tvl(api) {
  const key = formatUtcDate(api.timestamp)
  const rows = await getData()
  const row = rows.find((entry) => entry?.date === key && entry?.tvl != null)

  if (!row) throw new Error(`No Aquarius TVL data found for ${key}`)

  const tvl = Number(row.tvl) / 1e7
  if (!Number.isFinite(tvl)) {
    throw new Error(`Invalid Aquarius TVL value for ${row.date}: ${row.tvl}`)
  }

  api.addCGToken('tether', tvl)
}

module.exports = {
  start: '2024-07-01',
  misrepresentedTokens: true,
  methodology:
    'counts the liquidity of the Pools on AMM, data is pulled from the Aquarius API.',
  stellar: { tvl },
};
