const { getConfig } = require('../helper/cache')

const URL = 'https://apy.api.concrete.xyz/v1/vault:tvl/all'

const abis = {
  asset: "address:asset",
  totalAssets: "uint256:totalAssets",
  // getStrategies: "function getStrategies() view returns ((address strategy, (uint256 index, uint256 amount) allocation)[])"
}

const tvl = async (api) => {
  const chainId = api.chainId
  const data = await getConfig('concrete-xyz/vaults', URL)
  const vaults = Object.values(data[chainId]).map(v => v.address)

  const assets = await api.multiCall({ calls: vaults, abi: abis.asset })
  const totalAssets = await api.multiCall({ calls: vaults, abi: abis.totalAssets })

  for (let i = 0; i < vaults.length; i++) {
    api.add(assets[i], totalAssets[i])
  }
} 

const chains = ['ethereum', 'berachain', 'arbitrum', 'katana']
chains.forEach((chain) => {
  module.exports[chain] = { tvl }
})