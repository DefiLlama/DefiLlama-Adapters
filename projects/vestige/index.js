const { getConfig } = require('../helper/cache')

// Fixed existing method (matches frontend TVL): https://vestige.fi/explore
// async function tvl(api) {
//   const data = await getConfig('vestige/algorand-assets', 'https://api.vestigelabs.org/assets/list?limit=250&order_by=tvl&order_dir=desc')
//
//   for (const asset of data.results) {
//     if (!asset.total_lockup || asset.total_lockup <= 0) continue
//     const tokenId = asset.id === 0 ? '1' : String(asset.id)
//     const amount = Math.round((asset.total_lockup * 2) * (10 ** asset.decimals))
//     api.add(tokenId, amount)
//   }
// }

// New method using protocol-level tvl from Vestige API (zero tvl + non-active)
const tvl = async (api) => {
  const data = await getConfig('vestige/protocols', 'https://api.vestigelabs.org/protocols/10')
  if (!data || !data.total_tvl) return
  return api.addUSDValue(data.total_tvl) 
}

module.exports = {
  timetravel: false,
  deadFrom: "2025-06-01", // Last reported data before endpoint went down, endpoint shows vestige protocol as non-active: https://api.vestigelabs.org/protocols/10
  methodology: 'Counts all tokens locked in DEX liquidity pools on Algorand, as tracked by Vestige.',
  algorand: { tvl },
}