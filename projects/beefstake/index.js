const utils = require('../helper/utils');

const tvl = async (api) => {
  const { data } = await utils.fetchURL('https://vite-api.thomiz.dev/tvl/beefstake')
  return api.addUSDValue(Math.round(data.tvl))
}

module.exports = {
  deadFrom: "2024-06-01",
  timetravel: false,
  misrepresentedTokens: true,
  vite: { tvl },
}