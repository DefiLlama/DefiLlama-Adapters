const { get } = require('../helper/http')

const API =  "https://api.option.dance/api/v1/statistics/tvl"

async function tvl(api) {
  const { data } = await get(API);
  const tvl = data.total_value;
  return api.addUSDValue(Math.round(tvl))
}

module.exports = {
  deadFrom: '2025-01-01',
  misrepresentedTokens: true,
  mixin: { tvl },
};