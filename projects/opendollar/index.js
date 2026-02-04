const { getLogs2 } = require('../helper/cache/getLogs')

const config = {
  arbitrum: { factory: '0xa83c0f1e9eD8E383919Dde0fC90744ae370EB7B3', fromBlock: 203621588 },
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs2({ api, factory, eventAbi: 'event DeployCollateralJoin(bytes32 indexed _cType, address indexed _collateral, address indexed _collateralJoin)', fromBlock, })
      const tokensAndOwners = logs.map(i => [i._collateral, i._collateralJoin])
      return api.sumTokens({ tokensAndOwners })
    }
  }
})