const { get } = require('./helper/http')

async function tvl(api) {
  const result = await get('https://btn.group/pools/tvl')
  return api.addUSDValue(result)
}

module.exports = {
  misrepresentedTokens: true,
  secret: { tvl },
}