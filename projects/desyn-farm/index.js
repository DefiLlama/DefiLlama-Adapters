const axios = require("axios");

module.exports = {
  hallmarks: [
    [1719734400, "Launched on Merlin Chain"],
    [1718092800, "DeSyn KelpDAO Restaking Fund Launched"],
    [1713340800, "Restaking Fund Series Launched"]
  ],
  methodology: 'Focused on airdrops from DeSyn and new chains.',
}

const APIs = {
  farm: 'https://api.desyn.io/etf/defillama/get_pool_list?strategy_type=StrategyType1',
}

const abi = {
  getBalance: "function getBalance(address) view returns (uint256)"
}

const chains = ["ethereum", "arbitrum", "btr", "mode", "zklink", "core", "ailayer", "linea", "merlin", "scroll"];

async function getInfoListPool() {
  const { data } = await axios.get(APIs.farm)
  return data.data.config
}

chains.forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => {
        const poolLists =  await getInfoListPool()
        const { safePools } = poolLists[chain]
        const pools = safePools
        const tokens = await api.multiCall({  abi: 'address[]:getCurrentTokens', calls: pools})
        const calls = []
        const allTokens = []
        let i = 0
        for (const pool of pools) {
          for (const token of tokens[i]) {
            calls.push({ target: pool, params: token })
            allTokens.push(token)
          }
          i++
        }
        const allBals = await api.multiCall({ abi: abi.getBalance, calls })
        api.add(allTokens, allBals)
    }
    
  }
})