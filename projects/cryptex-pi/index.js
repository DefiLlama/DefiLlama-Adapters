const { getLogs } = require('../helper/cache/getLogs')
const config = {
  arbitrum: { vaultFactory: '0xad3565680aecee27a39249d8c2d55dac79be5ad0', fromBlock: 135921947, }
}

module.exports = {
  doublecounted: true,
};

Object.keys(config).forEach(chain => {
  const { vaultFactory, fromBlock, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs({ api, target: vaultFactory, eventAbi: 'event VaultCreated (address indexed vault, address indexed asset, address initialMarket)', onlyArgs: true, fromBlock, })
      const toa = logs.map(l => [l.asset, l.initialMarket])
      return api.sumTokens({ tokensAndOwners: toa })
    }
  }
})
