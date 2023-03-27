const { getLogs } = require('../helper/cache/getLogs')
const sdk = require('@defillama/sdk')

const config = {
  ethereum: {
    factory: '0xcb2e195d92e9da36ea1f186b8df09aade31a5dda',
    fromBlock: 16567503,  
  },
  optimism: {
    factory: '0x4adfe3ed020dac0ff69ca212f32be3b71185399e',
    fromBlock: 75797008,
  },
  arbitrum: {
    factory: '0x7cf580c74d6974f4d4e7eb6edcf052770f9e2645',
    fromBlock: 63190862,
  },
  moonriver: {
    factory: '0xc85f25eb74eaa5ad74eb6d9e8bdf686089a156d5',
    fromBlock: 3673027,
  },
}

module.exports = {};

Object.keys(config).forEach(chain => {
  const { factory, fromBlock, } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const balances = {}
      const logs = await getLogs({
        api,
        target: factory,
        topic: 'AddVault(address,string)',
        fromBlock,
        eventAbi: 'event AddVault(address vault, string vaultType)',
        onlyArgs: true,
      })

      const vaults = logs.filter(i => i.vaultType === 'SCYVault' || i.vaultType === 'SCYWEpochVault').map(i => i.vault)
      const bals = await api.multiCall({ abi: 'uint256:getTvl', calls: vaults })
      const tokens = await api.multiCall({ abi: 'address:underlying', calls: vaults })
      tokens.forEach((v, i) => bals[i] && sdk.util.sumSingleBalance(balances, v, bals[i], api.chain))
      
      // Add agg vault floats.
      const aggregators = logs.filter(i => i.vaultType === 'AggregatorVault' || i.vaultType === 'AggregatorWEpochVault').map(i => i.vault)
      if (aggregators.length > 0) {
        const aggFloats = await api.multiCall({abi: 'uint256:getFloat', calls: aggregators})
        const aggTokens = await api.multiCall({abi: 'address:underlying', calls: aggregators})
        aggTokens.forEach((v, i) => aggFloats[i] && sdk.util.sumSingleBalance(balances, v, aggFloats[i], api.chain))
      }
      
      return balances
    }
  }
})
