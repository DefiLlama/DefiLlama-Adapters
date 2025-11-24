const { get } = require('./helper/http')

async function tvl(api) {
  const result = await get('https://btn.group/pools/tvl')
  return api.addUSDValue(result)
}

module.exports = {
  deadFrom: '2025-09-01',
  misrepresentedTokens: true,
  secret: { tvl },
}