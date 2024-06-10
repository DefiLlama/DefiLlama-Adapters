const { getLogs } = require('../helper/cache/getLogs')
const config = {
  optimism: { factory: '0xfe7987b1ee45a8d592b15e8e924d50bfc8536143', fromBlock: 116055146 }
}

module.exports = {
  start: 1709780769, // globalDebtCeiling raised > 0
};

Object.keys(config).forEach(chain => {
  const { factory, fromBlock, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs({ api, target: factory, eventAbi: 'event DeployCollateralJoin (bytes32 indexed _cType, address indexed _collateral, address indexed _collateralJoin)', onlyArgs: true, fromBlock, })
      const tokensAndOwners = logs.map(log => [log._collateral, log._collateralJoin])
      return api.sumTokens({ tokensAndOwners })
    }
  }
})
