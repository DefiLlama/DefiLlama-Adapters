const { getLogs } = require('../helper/cache/getLogs')
const config = {
  ethereum: { factory: '0x7f2E24D2394f2bdabb464B888cb02EbA6d15B958', fromBlock: 19213560 },
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const data = await getPools(api)
      const ownerTokens = data.map(i => [[i.token0, i.token1], i.pool])
      return api.sumTokens({ ownerTokens })
    },
    borrowed: async (api) => {
      const data = await getPools(api)
      const pools = data.map(i => i.pool)
      const token0s = data.map(i => i.token0)
      const token1s = data.map(i => i.token1)
      const tokenOdata = await api.multiCall({ abi: 'function token0Data() view returns (uint256, uint256,  uint256 totalBorrow)', calls: pools })
      const token1data = await api.multiCall({ abi: 'function token1Data() view returns (uint256, uint256,  uint256 totalBorrow)', calls: pools })
      api.add(token0s, tokenOdata.map(i => i.totalBorrow))
      api.add(token1s, token1data.map(i => i.totalBorrow))
    },
  }

  async function getPools(api) {
    return getLogs({
      api,
      target: factory,
      eventAbi: 'event PoolCreated (address indexed token0, address indexed token1, address pool, uint256)',
      onlyArgs: true,
      fromBlock,
    })
  }
})

module.exports.ethereum.borrowed = ()  => ({})
module.exports.deadFrom = '2025-05-01' 
module.exports.hallmarks = [
  ['2025-01-15', 'Protocol was exploited'],
]