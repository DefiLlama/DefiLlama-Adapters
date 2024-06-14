const { getLogs } = require('../helper/cache/getLogs')

const config = {
  avax: { factory: '0xdd723d9273642d82c5761a4467fd5265d94a22da', fromBlock: 31563526 },
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs({
        api,
        target: factory,
        eventAbi: 'event Pair (address indexed token0, address indexed token1, uint256 curveId, address pair)',
        onlyArgs: true,
        fromBlock,
      })
      const ownerTokens = logs.map(i => [[i.token0, i.token1,], i.pair])
      return api.sumTokens({ ownerTokens })
    }
  }
})