const axios = require("axios");

module.exports = {
  doublecounted: true,
  methodology: 'Engages with DeFi protocols like Lending, DEX, and Restaking, offering both airdrops and structured yield options.',
}

const APIs = {
    yield: 'https://api.desyn.io/etf/defillama/get_pool_list?strategy_type=StrategyType2',
}
  
const chains = ["ethereum", "arbitrum", "btr", "mode", "zklink", "core", "ailayer", "linea", "merlin", "scroll"];

// This is aSTETH, 
// before the design of the semi-closed soETH, 
// the contract in order to limit the closure of the time, 
// the user can still deposit, 
// so he was given a maximum value of the balance,
// which will become negative after adding any number, blocking the user to put in
const leverageStaking = '0x1982b2F5814301d4e9a8b0201555376e62F82428'

const abi = {
  getBalance: "function getBalance(address) view returns (uint256)"
}

async function getInfoListPool() {
    const { data } = await axios.get(APIs.yield)
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
              if(token == leverageStaking) break
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