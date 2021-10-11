const axios = require("axios")
const retry = require('async-retry')

async function staking() {
  const { data } = await axios.get("https://us-central1-only1-staking-stats.cloudfunctions.net/tvl")

  return {
    'only1': data.totalTvl
  }
}

module.exports = {
  solana: {
    staking,
    tvl: async () => ({})
  }
}
