const { getLogs } = require('../helper/cache/getLogs')

const config = {
  ethereum: { factory: '0xDb2222735e926f3a18D7d1D0CFeEf095A66Aea2A', fromBlock: 18029801, },
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {

      const logs = await getLogs({
        api,
        target: factory,
        eventAbi: 'event NewDeployment (address collateral, address priceFeed, address troveManager, address sortedTroves)',
        onlyArgs: true,
        fromBlock,
      })
      return api.sumTokens({ tokensAndOwners: logs.map(log => [log.collateral, log.troveManager])})
    }
  }
})
