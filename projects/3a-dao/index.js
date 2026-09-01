const { getLogs } = require('../helper/cache/getLogs')

const config = {
  polygon: { factory: '0x4760847023fa0833221ae76E01Db1E483A5D20e0', fromBlock: 49852705 },
  linea: { factory: '0x65c6FD9B3a2A892096881e28f07c732ed128893E', fromBlock: 3045954 },
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs({
        api,
        target: factory,
        eventAbi: 'event NewVault(address indexed vault, string name, address indexed owner)',
        onlyArgs: true,
        fromBlock,
      })
      const vaults = logs.map(log => log.vault)
      const tokens = await api.multiCall({ abi: 'address[]:collaterals', calls: vaults })
      const ownerTokens = tokens.map((token, i) => [token, vaults[i]])
      return api.sumTokens({ ownerTokens })
    }
  }
})