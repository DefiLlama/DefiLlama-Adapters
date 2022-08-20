const axios = require("axios")
const retry = require('async-retry')

async function staking() {
  const { data } = await axios.get("https://api.only1.app/staking-pools?pageSize=100")

  return {
    'only1': data.data.reduce((a, i) => (a + i.tvl/1e9), 0)
  }
}

module.exports = {
  timetravel: false,
  methodology: "TVL is the sum of all tokens in the staking pools",
  solana: {
    staking,
    tvl: async () => ({})
  }
}
