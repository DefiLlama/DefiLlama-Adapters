const axios = require('axios')

const url = "https://public.nerve.network/nerve/tvl"

const tvl = async (api) => {
  const { data } = await axios(url)
  api.addUSDValue(Math.round(data.totalUsdTvl))
}

module.exports = {
  misrepresentedTokens: true,
  nuls: { tvl }
}