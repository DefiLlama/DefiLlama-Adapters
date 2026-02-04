const { get } = require('../helper/http')

const tvl = async (api) => {
  const { tvl } = await get('https://api.deotoken.com/api/demeter/supply-data')
  return api.addUSDValue(Math.round(tvl))
}

module.exports = {
  misrepresentedTokens: true,
  sora: { tvl },
}