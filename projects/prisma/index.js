const { getLogs } = require('../helper/cache/getLogs')

const config = {
  ethereum: { factory: '0x70b66e20766b775b2e9ce5b718bbd285af59b7e1', fromBlock: 18029801, },
}

module.exports.hallmarks = [
  [1698922200,"Justin Sun Deposited"]
],
Object.keys(config).forEach(chain => {
  const { factory, fromBlock, } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {

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
