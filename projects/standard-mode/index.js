const { getLogs } = require('../helper/cache/getLogs')
const config = {
  mode: { factory: '0x4D1b18A7BDB8D0a02f692398337aBde8DeB8FB09', fromBlock: 4381503, },
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const logs = await getLogs({ api, target: factory, eventAbi: 'event PairAdded(address orderbook, address base, address quote, uint8 bDecimal, uint8 qDecimal)', onlyArgs: true, fromBlock, })
      const ownerTokens = logs.map(log => [[log.base, log.quote], log.orderbook])
      return api.sumTokens({ ownerTokens})
    }
  }
})