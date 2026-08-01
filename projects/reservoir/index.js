const { getLogs } = require('../helper/cache/getLogs')

const config = {
  avax: { factory: '0x1A49Bc8464731A08c16EdF17F33CF77db37228a4', fromBlock: 62736566 },
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
