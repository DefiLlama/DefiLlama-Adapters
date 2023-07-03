const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/cache/getLogs')

const config = {
  bsc: { factory: '0x7c3d53606f9c03e7f54abddffc3868e1c5466863', fromBlock: 29462097 },
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const logs = await getLogs({
        api,
        target: factory,
        topics: ['0xe857b53ada03b8d88fd7546e77c34d3b68996e6ce330f0edee6e813b7daea099'],
        eventAbi: 'event NewPool (address indexed tokenX, address indexed tokenY, uint16 indexed fee, uint24 pointDelta, address pool)',
        onlyArgs: true,
        fromBlock,
      })
      const ownerTokens = logs.map(log => [[log.tokenX, log.tokenY], log.pool])
      return sumTokens2({ api, ownerTokens })
    }
  }
})