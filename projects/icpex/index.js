const axios = require('axios')

const url = 'https://stat.icpex.org/durable/api/pair/query/all/metadata'

const tvl = async (api) => {
  const { data } = await axios.get(url)
  data.data.forEach(({ locked }) => {
    const { total_usd } = locked
    if (!total_usd) return
    api.addUSDValue(total_usd)
  })
}

module.exports = {
  misrepresentedTokens: true,
  icp: { tvl },
}