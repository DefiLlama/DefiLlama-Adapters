const axios = require("axios")
const { sumTokens2 } = require('./helper/solana')

async function staking() {
  // const { data } = await axios.get("https://us-central1-only1-staking-stats.cloudfunctions.net/tvl")
  const { data: { data } } = await axios.get("https://api.only1.app/staking-pools?limit=100&sort=numTokensLocked%3Adesc")
  const { data: { data: data1 } } = await axios.get("https://api.only1.app/staking-pools?limit=100&page=2&sort=numTokensLocked%3Adesc")

  data.push(...data1)
  const owners = data.map(i => i.address)
  return sumTokens2({ tokens: ['3bRTivrVsitbmCTGtqwp7hxXPsybkjn4XLNtPsHqa3zR'], owners, })
}

module.exports = {
  timetravel: false,
  methodology: "TVL is the sum of all tokens in the staking pools",
  solana: {
    staking,
    tvl: async () => ({})
  }
}