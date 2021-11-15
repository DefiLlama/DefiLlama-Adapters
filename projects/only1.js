const axios = require("axios")
const retry = require('async-retry')

async function tvl() {
  const { data } = await axios.get("https://us-central1-only1-staking-stats.cloudfunctions.net/tvl")

  return {
    only1: data.totalTvl
  }
}

module.exports = {
  methodology: "TVL is the sum of all tokens in the staking pools",
  tvl,
  solana: {
    tvl
  }
}
