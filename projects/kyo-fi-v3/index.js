const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const factories = [
  { factory: '0x137841043180BBA8EF52828F9030D1b7fE065F95', fromBlock: 1820393 },  // legacy 
  { factory: '0x81fBB18e1F5a7E9B2640107df8292271470EC7bf', fromBlock: 15116833 },
]

const eventAbi = 'event PoolCreated(address indexed token0, address indexed token1, uint24 indexed fee, int24 tickSpacing, address pool)'

module.exports = {
  soneium: {
    tvl: async (api) => {
      const ownerTokens = []
      for (const { factory, fromBlock } of factories) {
        const logs = await getLogs({
          api,
          target: factory,
          fromBlock,
          eventAbi,
          onlyArgs: true,
        })
        logs.forEach(i => ownerTokens.push([[i.token0, i.token1], i.pool]))
      }
      return sumTokens2({ api, ownerTokens })
    }
  }
}