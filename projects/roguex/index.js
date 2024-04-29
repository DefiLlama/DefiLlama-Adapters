const { getLogs } = require('../helper/cache/getLogs')

// const graphUri = "https://api.studio.thegraph.com/query/42478/blast_mainnet/version/latest";

const config = {
  blast: { factory: '0x5B0b4b97edb7377888E2c37268c46E28f5BD81d0', fromBlock: 202321, },
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs({ api, target: factory, eventAbi: 'event PoolCreated (address indexed token0, address indexed token1, uint24 indexed fee, int24 tickSpacing, address pool, address tradePool)', onlyArgs: true, fromBlock, })
      const ownerTokens = logs.map(i => [[[i.token0, i.token1], i.pool], [[i.token0, i.token1], i.tradePool]]).flat()
      return api.sumTokens({ ownerTokens })
    }
  }
})
