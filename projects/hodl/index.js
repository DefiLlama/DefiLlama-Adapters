const { get } = require('../helper/http')

const API = 'https://hodl-api.fox.one/api/pools'

const tvl = async (api) => {
  const { data } = await get(API)
  data.pools.forEach(({ amount, price }) => {
    api.addUSDValue(Math.round(amount * price))
  })
}

module.exports = {
  deadFrom: "2024-10-01",
  misrepresentedTokens: true,
  mixin: { tvl }
}
