const { getLogs } = require('../helper/cache/getLogs')
const { getUniqueAddresses } = require('../helper/utils')

const config = {
  ethereum: { factory: '0xc67cb09d08521cD1dE6BAAC46824261eb1dB8800', fromBlock: 16828337, },
  arbitrum: { factory: '0xf878a060D4d51704B14e8f68B51185bF5DbFE3A1', fromBlock: 69857947, },
  optimism: { factory: '0x45c158E0ee76c76E525BaB941991268249e95331', fromBlock: 80641123, },
}

module.exports = {
};

Object.keys(config).forEach(chain => {
  const { factory, fromBlock, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs({
        api,
        target: factory,
        topics: ['0x4f2ce4e40f623ca765fc0167a25cb7842ceaafb8d82d3dec26ca0d0e0d2d4896'],
        eventAbi: 'event PoolCreated(address indexed controller, address provider)',
        onlyArgs: true,
        fromBlock,
      })
      const providers = getUniqueAddresses(logs.map(i => i.provider))
      const tokens = await api.multiCall({  abi: 'address:underlying', calls: providers}) 
      const balances = await api.multiCall({  abi: 'uint256:underlyingBalance', calls: providers}) 
      api.addTokens(tokens, balances)
      return api.getBalances()
    }
  }
})
