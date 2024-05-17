const { getLogs } = require('../helper/cache/getLogs')
const config = {
  mode: [{ factory: '0x4D1b18A7BDB8D0a02f692398337aBde8DeB8FB09', fromBlock: 4381503, }, { factory: '0xaA0075035b814eA7638C15100cFa86a03397bE91', fromBlock: 4937855, },],
  blast: [{ factory: '0x2CC505C4bc86B28503B5b8C450407D32e5E20A9f', fromBlock: 434946, }, { factory: '0xA8a336Ec4D546c2Dc9F188E0Be4B3FB174791813', fromBlock: 616605, },]
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => {
      const ownerTokens = []
      for (const { factory, fromBlock } of config[chain]) {
        const logs = await getLogs({ api, target: factory, eventAbi: 'event PairAdded(address orderbook, address base, address quote, uint8 bDecimal, uint8 qDecimal)', onlyArgs: true, fromBlock, })
        const _ownerTokens = logs.map(log => [[log.base, log.quote], log.orderbook])
        ownerTokens.push(..._ownerTokens)
      }
      return api.sumTokens({ ownerTokens })
    }
  }
})