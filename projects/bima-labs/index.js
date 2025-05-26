const { getLogs } = require('../helper/cache/getLogs')

const config = {
  ethereum: { factory: '0xc5790164d3CCB6533b241EeE3Fd7f56862759376', fromBlock: 22095715, },
  hemi: { factory: '0xc5790164d3CCB6533b241EeE3Fd7f56862759376', fromBlock: 1391406, },
  core: { factory: '0xc5790164d3CCB6533b241EeE3Fd7f56862759376', fromBlock: 23086081, },
  sonic: { factory: '0xc5790164d3CCB6533b241EeE3Fd7f56862759376', fromBlock: 23769061, },
  plume: { factory: '0xc5790164d3CCB6533b241EeE3Fd7f56862759376', fromBlock: 1219008, },
  goat: { factory: '0xc5790164d3CCB6533b241EeE3Fd7f56862759376', fromBlock: 3742120, },
//   bnb: { factory: '0xc5790164d3CCB6533b241EeE3Fd7f56862759376', fromBlock: 50108286, },
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
