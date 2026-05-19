const { getConfig } = require('../helper/cache')

const TVL_URL = 'https://storage.googleapis.com/defillama-stellar-tvl/stellar-tvl-raw.json'

async function fetchBalances() {
  const data = await getConfig('stellar-amm/tvl_raw', TVL_URL)
  const rows = Array.isArray(data) ? data : String(data).trim().split('\n').map(l => JSON.parse(l))
  const latestDay = rows.reduce((max, r) => r.day > max ? r.day : max, '')
  return rows.filter(r => r.day === latestDay)
}

async function tvl(api) {
  const rows = await fetchBalances()
  for (const row of rows) {
    const balance = Number(row.liquidity_pools_tvl)
    if (!balance || !row.contract_id) continue
    api.add(row.contract_id, Math.round(balance * 1e7))
  }
}

module.exports = {
  methodology: 'Total value of assets in Stellar native AMM liquidity pools.',
  timetravel: false,
  stellar: { tvl },
}
