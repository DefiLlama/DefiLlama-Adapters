const { getConfig } = require('../helper/cache')

const chains = ["ethereum", "arbitrum", "btr", "mode", "zklink", "core", "ailayer", "linea", "merlin", "scroll", "bsquared", "hemi", "bsc", "xsat"];

const abi = {
  getBalance: "function getBalance(address) view returns (uint256)"
}

// The desyn asset arrangement needs to be requested via the rest api form
async function getInfoListPool(strategy_type, chain) {
  const data = await getConfig('desyn/' + strategy_type, `https://api.desyn.io/etf/defillama/get_pool_list?strategy_type=${strategy_type}`)
  return data.data.config[chain]?.safePools
}

// This is aSTETH, 
// before the design of the semi-closed soETH, 
// the contract in order to limit the closure of the time, 
// the user can still deposit, 
// so he was given a maximum value of the balance,
// which will become negative after adding any number, blocking the user to put in
const leverageStaking = '0x1982b2F5814301d4e9a8b0201555376e62F82428'


function getTvlFunction(strategy_type, isDoubleCounted) {
  return async (api) => {
    const pools = await getInfoListPool(strategy_type, api.chain)
    if (!pools?.length) return;
    const tokens = await api.multiCall({ abi: 'address[]:getCurrentTokens', calls: pools })
    const calls = []
    const tokensAndOwners = []
    const allTokens = []
    let i = 0

    for (const pool of pools) {
      for (const token of tokens[i]) {
        if (!isDoubleCounted) {
          tokensAndOwners.push([token, pool])
        } else {
          calls.push({ target: pool, params: token })
          allTokens.push(token)
        }
      }
      i++
    }

    if (!isDoubleCounted) return api.sumTokens({ tokensAndOwners })

    const allBals = await api.multiCall({ abi: abi.getBalance, calls })
    api.add(allTokens, allBals)

    // rest api type:: StrategyType2
    if (strategy_type === 'StrategyType2')
      api.removeTokenBalance(leverageStaking)
  }
}


module.exports = {
  getTvlFunction,
  chains
}