const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  arbitrum: { factory: '0xfd513630f697a9c1731f196185fb9eba6eaac20b', fromBlock: 173451651 },
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const logs = await getLogs({
        api,
        target: factory,
        eventAbi: 'event PoolCreated (address indexed pool, address indexed cfmm, uint16 indexed protocolId, address implementation, address[] tokens, uint256 count)',
        onlyArgs: true,
        fromBlock,
      })
      const ownerTokens = logs.map(i => [[...i.tokens, i.cfmm], i.pool])
      return sumTokens2({ ownerTokens, api, resolveLP: true, })
    }
  }
})