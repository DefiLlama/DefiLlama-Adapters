const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  arbitrum: {
    factories: [
      { factory: '0xe048ccE443E787c5b6FA886236De2981D54E244f', fromBlock: 132429931 },
    ],
  },
}

Object.keys(config).forEach(chain => {
  const { factories } = config[chain]
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
      return sumTokens2({ ownerTokens, api, resolveLP: true, })
    }
  }
})