const { get } = require('../helper/http')

const API = 'https://mtg-api.b.watch/api/etfs'

const tvl = async (api) => {
  const { data } = await get(API)
  data.etfs.forEach(({ gems }) => {
    gems.forEach(({ balance, price }) => {
      api.addUSDValue(Math.round(balance * price))
    })
  })

}

module.exports = {
  misrepresentedTokens: true,
  mixin: { tvl },
}

