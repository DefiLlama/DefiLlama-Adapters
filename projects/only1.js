const axios = require("axios")
const retry = require('async-retry')

async function fetch() {
  const [tvlResponse, coingeckoResponse] = await Promise.all([
    "https://us-central1-only1-staking-stats.cloudfunctions.net/tvl",
    "https://api.coingecko.com/api/v3/simple/price?ids=only1&vs_currencies=usd"
  ].map((url) => retry(async () => {
    const { data } = await axios.get(url)

    return data
  })))
  const tvl = tvlResponse.totalTvl
  const tokenPrice = coingeckoResponse.only1.usd

  return tokenPrice * tvl
}

module.exports = {
  fetch
}
