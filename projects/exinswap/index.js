const { get } = require('../helper/http')

const API = 'https://app.exinswap.com/api/v1/statistic/total'

const tvl = async (api) => {
  const { data } = await get(API)
  const tvl = data.totalUsdBalance;
  api.addUSDValue(Math.round(tvl))
}

module.exports = {
  deadFrom: '2023-11-01',
  misrepresentedTokens: true,
  mixin: { tvl }
}