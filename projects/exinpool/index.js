const { get } = require('../helper/http')

const API = 'https://mixin.exinpool.com/api/v1/node/status'

const tvl = async (api) => {
  const { data } = await get(API)
  const tvl = data.totalValueUsd;
  api.addUSDValue(Math.round(tvl))
}

module.exports = {
  misrepresentedTokens: true,
  mixin: { tvl }
}