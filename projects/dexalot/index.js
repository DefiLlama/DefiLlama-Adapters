const { sumTokens2 } = require('../helper/unwrapLPs')
const { get } = require("../helper/http");

const dexalotAPI = "https://api.dexalot.com"

function getTVL(env) {
  return async (api) => {
    const mainnetRFQs = await get(`${dexalotAPI}/privapi/trading/deployment?contracttype=MainnetRFQ&env=${env}`)
    const allTokens = await get(`${dexalotAPI}/privapi/trading/tokens`)
    const tokens = allTokens.filter((t) => !t.isvirtual && t.env === env).map((t) => t.address)
    return sumTokens2({ api, owner: mainnetRFQs[0].address, tokens })
  }
}

async function getDexalotTVL(_) {
  const lockedTokens = await get(`${dexalotAPI}/api/stats/orderstvl`)
  const res = {}
  for (const {coingecko_id, amount} of lockedTokens) {
    // Ignore counting tokens without coingecko_id
    if (coingecko_id == null) {
      continue
    }
    res[coingecko_id] = amount
  }
  return res
}

module.exports = {
  methodology: "Dexalot TVL is comprised of the token balances locked in the MainnetRFQ (swap) contracts and the value locked in open orders on the Dexalot chain.",
  arbitrum: {
    tvl: getTVL("production-multi-arb"),
  },
  avax: {
    tvl: getTVL("production-multi-avax"),
  },
  base: {
    tvl: getTVL("production-multi-base"),
  },
  dexalot: {
    tvl: getDexalotTVL,
  },
}