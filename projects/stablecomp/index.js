const { getConfig } = require('../helper/cache')

const chains = ['ethereum',]
chains.forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => {
      const data = await getConfig('stablecomp', 'https://services.stablecomp.com/vaults')
      let { vaults } = data[chain]
      vaults = Object.values(vaults)
      const tokens = await api.multiCall({ abi: 'address:token', calls: vaults })
      const bals = await api.multiCall({ abi: 'uint256:balance', calls: vaults })
      api.addTokens(tokens, bals)
      return api.getBalances()
    }
  }
})