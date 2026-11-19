const { get } = require('./helper/http')
const { getConfig } = require('./helper/cache')

const blacklistedTokens = new Set(['3178895177', '1387238831'])

async function tvl(api) {
  await getConfig('pact-fi', 'https://api.pact.fi/api/internal/pools_details/all')
  const global_data = await get("https://api.pact.fi/api/internal/pools_details/all")
  let usdValue = 0
  const assetTable = []
  for (const pool of global_data) {
    const symbol = pool.assets.map(i => i.unit_name	).join("-")
    assetTable.push([symbol, pool.tvl_usd])
    if (!pool.assets.some(i => blacklistedTokens.has(i.on_chain_id))) {
      usdValue += +pool.tvl_usd
    }
  }
  // console.table(assetTable)
  return api.addUSDValue(Math.round(usdValue))
}

module.exports = {
  misrepresentedTokens: true,
  algorand: { tvl },
};