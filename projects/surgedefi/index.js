const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  "xrplevm": { factory: '0x05655ae2c8f310387B85DCB3785b8756F1759d86', fromBlock: 123251, }
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock, } = config[chain]
  const _getLogs = (api) => getLogs({
    api,
    target: factory,
    topics: ['0x783cca1c0412dd0d695e784568c96da2e9c22ff989357a2e8b1d9b2b4e6b7118'],
    eventAbi: 'event PoolCreated(address indexed token0,address indexed token1,uint24 indexed fee,int24 tickSpacing,address pool)',
    onlyArgs: true,
    fromBlock,
  })
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await _getLogs(api)
      const ownerTokens = logs.map(l => [[l.token0, l.token1], l.pool])
      return sumTokens2({ api, ownerTokens, })
    }
  }
})
