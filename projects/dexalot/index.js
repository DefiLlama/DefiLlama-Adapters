const { get } = require("../helper/http");
const { exportDexalotTVL } = require("./helper");

const dexalotAPI = "https://api.dexalot.com"

async function getDexalotChainLockedOrders(_) {
  const lockedTokens = await get(`${dexalotAPI}/api/stats/orderstvl`)
  const res = {}
  for (const {coingecko_id, amount} of lockedTokens) {
    // Ignore counting tokens without coingecko_id
    if (coingecko_id == null) {
      continue
    }
    res[coingecko_id] = +amount
  }
  return res
}

module.exports = {
  methodology: "Dexalot TVL is comprised of the token balances locked in the MainnetRFQ (swap) contracts and the value locked in open orders on the Dexalot chain.",
  dexalot: {
    tvl: getDexalotChainLockedOrders,
  },
  ...exportDexalotTVL("MainnetRFQ")
}