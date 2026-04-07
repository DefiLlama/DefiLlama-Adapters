const { getConfig } = require('../helper/cache')
const { get } = require('../helper/http')

const TVL_URL = 'https://storage.googleapis.com/defillama-stellar-tvl/tvl_agg.json'

async function fetchBalances() {
  const data = await getConfig('stellar-dex/tvl_agg', TVL_URL)
  const rows = Array.isArray(data) ? data : String(data).trim().split('\n').map(l => JSON.parse(l))
  const latestDay = rows.reduce((max, r) => r.day > max ? r.day : max, '')
  return rows.filter(r => r.day === latestDay)
}

async function getContractId(code, issuer) {
  try {
    const { _embedded: { records } } = await get(`https://horizon.stellar.org/assets?asset_code=${code}&asset_issuer=${issuer}`)
    return records[0]?.contract_id
  } catch { return null }
}

async function tvl(api) {
  const rows = await fetchBalances()
  const contractIds = await getConfig('stellar-dex/contract-ids', undefined, {
    fetcher: async () => {
      const map = {}
      for (const row of rows) {
        if (!Number(row.total_tvl) || row.asset_code === 'XLM') continue
        const id = await getContractId(row.asset_code, row.asset_issuer)
        if (id) map[`${row.asset_code}-${row.asset_issuer}`] = id
      }
      return map
    }
  })

  for (const row of rows) {
    const balance = Number(row.total_tvl)
    if (!balance) continue
    if (row.asset_code === 'XLM') {
      api.add('XLM', Math.round(balance * 1e7))
    } else {
      const key = `${row.asset_code}-${row.asset_issuer}`
      const contractId = contractIds[key]
      if (contractId) {
        // contract IDs have 7 decimals on server
        api.add(contractId, Math.round(balance * 1e7))
      } else {
        // CODE-ISSUER format has 0 decimals on server
        api.add(key, balance)
      }
    }
  }
}

module.exports = {
  methodology: 'Total value of all sell offers in the built-in Stellar Decentralized exchange.',
  timetravel: false,
  stellar: { tvl },
}
