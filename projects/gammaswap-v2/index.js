const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  arbitrum: {
    factories: [
      { factory: '0xfd513630f697a9c1731f196185fb9eba6eaac20b', fromBlock: 173451651 },
    ],
    deltaswapFactory: '0xcb85e1222f715a81b8edaeb73b28182fa37cffa8'
  },
  base: {
    factories: [
      { factory: '0xfd513630f697a9c1731f196185fb9eba6eaac20b', fromBlock: 12475877 },
    ],
  },
}

Object.keys(config).forEach(chain => {
  const { factories, deltaswapFactory } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const ownerTokens = []
      for (const { factory, fromBlock } of factories) {
        const logs = await getLogs({
          api,
          target: factory,
          eventAbi: 'event PoolCreated (address indexed pool, address indexed cfmm, uint16 indexed protocolId, address implementation, address[] tokens, uint256 count)',
          onlyArgs: true,
          fromBlock,
        })
        const _ownerTokens = logs.map(i => [[...i.tokens, i.cfmm], i.pool])
        ownerTokens.push(..._ownerTokens)
      }
      const blacklistedTokens = []
      if (deltaswapFactory) {
        const pairs = await api.fetchList({  lengthAbi: 'allPairsLength', itemAbi: 'allPairs', target: deltaswapFactory})
        blacklistedTokens.push(...pairs)
      }
      return sumTokens2({ ownerTokens, api, resolveLP: true, blacklistedTokens, })
    }
  }
})