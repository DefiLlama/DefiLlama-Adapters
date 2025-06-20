const { get } = require('./helper/http')
const { getConfig } = require('./helper/cache')

async function tvl(api) {
  await getConfig('pact-fi', 'https://api.pact.fi/api/internal/pools_details/all')
  const global_data = await get("https://api.pact.fi/api/global_stats")
  return api.addUSDValue(Math.round(global_data.tvl_usd))
}

module.exports = {
  misrepresentedTokens: true,
  algorand: { tvl },
};