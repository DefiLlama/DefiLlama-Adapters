const axios = require("axios");
const { get } = require('../helper/http')
const { getConfig } = require('../helper/cache')
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

const chains = {
  ethereum: 'ethereum',
  arbitrum: 'arbitrum',
  btr: 'btr',
  mode: 'mode',
  zklink: 'zklink',
  core: 'core',
  ailayer: 'ailayer',
}

const abi = {
  getBalance: "function getBalance(address) view returns (uint256)"
}

async function tvl(api) {
      const {data} = await axios.get(APIs.farm)
      const config = data.data.config

      Object.keys(config).forEach(async chain => {
        const { safePools } = config[chain]
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
      })
}


Object.keys(chains).forEach(chain => {
  module.exports[chain] = { tvl }
})
