const { getLogs2 } = require('../helper/cache/getLogs')

const config = {
  blast: { factory: '0x7E05363E225c1c8096b1cd233B59457104B84908', fromBlock: 1067907 },
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs2({ api, factory, eventAbi: 'event LogPoolAdded (address baseToken, address quoteToken, address creator, address pool)', fromBlock, })
      const ownerTokens = logs.map(log => [[log.baseToken, log.quoteToken], log.pool])
      return api.sumTokens({ ownerTokens })
    }
  }
})