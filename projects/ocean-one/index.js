const { get } = require('../helper/http')

const API = 'https://events.ocean.one/assets'

const tvl = async (api) => {
  const { data } = await get(API)
  data.forEach(({ balance, price_usd }) => {
    api.addUSDValue(Math.round(balance * price_usd))
  })
}

module.exports = {
  misrepresentedTokens: true,
  mixin: { tvl },
}