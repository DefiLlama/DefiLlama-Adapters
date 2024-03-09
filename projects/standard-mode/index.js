const { getLogs } = require('../helper/cache/getLogs')
const config = {
  mode: { factory: '0x2B6151F6a1bd30c11E94a91715E4CC98bFC8151c', fromBlock: 4918515, },
  blast: { factory: '0x4D16DAFa4f30f29458F62e17cf41bef069aa18F9', fromBlock: 598408, }, 
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
