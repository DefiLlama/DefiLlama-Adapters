const { getConfig } = require('../helper/cache')

const config = {
  ethereum: {},
  arbitrum: {},
  base: {},
  linea: {},
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => {
      const { [chain]: data } = await getConfig('theo-network', "https://vaults.theo.xyz/vaults/vaultInfo");

      const calls = Object.values(data).map(i => i.contract)
      const tokens = Object.values(data).map(i => i.asset)
      const bals = await api.multiCall({ abi: 'uint256:totalBalance', calls })
      api.add(tokens, bals)
    }
  }
})