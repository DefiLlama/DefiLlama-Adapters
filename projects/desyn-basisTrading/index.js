const axios = require("axios");

module.exports = {
    doublecounted: true,
    methodology: 'Combines on-chain airdrops with stable returns from basis trading on Binance.',
  }
  
const APIs = {
    basis: 'https://api.desyn.io/etf/defillama/get_pool_list?strategy_type=StrategyType3',
}
  
const abi = {
    getBalance: "function getBalance(address) view returns (uint256)"
}

const chains = ["ethereum", "arbitrum", "btr", "mode", "zklink", "core", "ailayer", "linea", "merlin", "scroll"];
  
async function getInfoListPool() {
    const { data } = await axios.get(APIs.basis)
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