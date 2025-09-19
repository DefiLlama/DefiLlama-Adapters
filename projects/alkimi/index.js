const staking = require("./staking")
const ammPools = require("./ammPools")

async function tvl() {
  const [stake, pools] = await Promise.all([staking(), ammPools()])
  const balances = {}

  for (const [token, bal] of Object.entries(stake)) {
    balances[token] = (balances[token] || 0) + bal
  }
  for (const [token, bal] of Object.entries(pools)) {
    balances[token] = (balances[token] || 0) + bal
  }
  return balances
}

module.exports = {
  methodology: "TVL = liquidity in Cetus pools + staking vault. Staking is also shown separately.",
  sui: {
    tvl,
    staking,
  },
}
