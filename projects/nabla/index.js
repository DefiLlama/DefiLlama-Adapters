
const { getLogs2 } = require('../helper/cache/getLogs')

const config = {
  base: { factory: '0x791Fee7b66ABeF59630943194aF17B029c6F487B', fromBlock: 19980311 },
  arbitrum: { factory: '0x7bcFc8b8ff61456ad7C5E2be8517D01df006d18d', fromBlock: 240797440 },
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs2({ api, factory, eventAbi: "event SwapPoolRegistered(address indexed sender, address pool, address asset)", fromBlock, })
      const pools = logs.map(log => log.pool)
      const tokensAndOwners = logs.map(i => [i.asset, i.pool])
      let backstops = await api.multiCall({ abi: 'address:backstop', calls: pools })
      backstops = [...new Set(backstops)]
      const bTokens = await api.multiCall({ abi: 'address:asset', calls: backstops })
      backstops.forEach((backstop, i) => tokensAndOwners.push([bTokens[i], backstop]))
      return api.sumTokens({ tokensAndOwners })
    }
  }
})
