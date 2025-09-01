const { get } = require('./helper/http')
const { getConfig } = require('./helper/cache')

const blacklistedTokens = new Set(['3178895177'])

async function tvl(api) {
  await getConfig('pact-fi', 'https://api.pact.fi/api/internal/pools_details/all')
  const global_data = await get("https://api.pact.fi/api/internal/pools_details/all")
  let usdValue = 0
  for (const pool of global_data) {
    if (!pool.assets.some(i => blacklistedTokens.has(i.on_chain_id))) {
      usdValue += +pool.tvl_usd
    }
  }
  return api.addUSDValue(Math.round(usdValue))
}

module.exports = {
  misrepresentedTokens: true,
  algorand: { tvl },
};