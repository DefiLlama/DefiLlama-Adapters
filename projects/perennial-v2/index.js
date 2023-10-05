const { getLogs } = require('../helper/cache/getLogs')

const config = {
  arbitrum: { factory: '0xad3565680aecee27a39249d8c2d55dac79be5ad0', fromBlock: 135921947 },
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock, } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const logs = await getLogs({
        api,
        target: factory,
        eventAbi: 'event VaultCreated (address indexed vault, address indexed asset, address initialMarket)',
        onlyArgs: true,
        fromBlock,
      })
      return api.sumTokens({ tokensAndOwners: logs.map(log => [log.asset, log.initialMarket])})
    }
  }
})