const { sumTokens2 } = require('../helper/unwrapLPs')
const { get } = require("../helper/http");

const dexalotTradingAPI = "https://api.dexalot.com/privapi/trading"

// [chain]: env
const supportedChains = {
  "arbitrum": "production-multi-arb",
  "avax": "production-multi-avax",
  "base": "production-multi-base"
}

function getTVL(env, contractName) {
  return async (api) => {
    const contract = await get(`${dexalotTradingAPI}/deployment?contracttype=${contractName}&env=${env}`)
    const allTokens = await get(`${dexalotTradingAPI}/tokens`)
    const tokens = allTokens.filter((t) => !t.isvirtual && t.env === env).map((t) => t.address)
    return sumTokens2({ api, owner: contract[0].address, tokens })
  }
}

// Returns TVL for each supported chain (excludes Dexalot chain)
function exportDexalotTVL(contractName) {
  const res = {}
  for (const [chain, env] of Object.entries(supportedChains)) {
    res[chain] = {tvl: getTVL(env, contractName)}
  }
  return res
}

module.exports = {
  exportDexalotTVL
}