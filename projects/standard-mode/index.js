const { getLogs } = require('../helper/cache/getLogs')
const config = {
  mode: { factory: '0xaA0075035b814eA7638C15100cFa86a03397bE91', fromBlock: 4937855, },
  blast: { factory: '0xA8a336Ec4D546c2Dc9F188E0Be4B3FB174791813', fromBlock: 616605, }, 
}
0xA8a336Ec4D546c2Dc9F188E0Be4B3FB174791813
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
