const { getConfig } = require('../helper/cache')

const URL = 'https://apy.api.concrete.xyz/v1/vault:tvl/all'

const abis = {
  asset: "address:asset",
  totalAssets: "uint256:totalAssets",
  // getStrategies: "function getStrategies() view returns ((address strategy, (uint256 index, uint256 amount) allocation)[])"
}

const excludeVaults = [
  '0x4def5abcfba7babe04472ee4835f459daf4bd45f',
  '0x5854c7693459c6e316a96565776b72d94ee0e5fd',
  '0xb04e166fd5d7078bb7b3412406609fd92855a08f',
]

const tvl = async (api) => {
  const chainId = api.chainId
  const data = await getConfig('concrete-xyz/vaults', URL)
  const vaults = Object.values(data[chainId]).map(v => v.address).filter(a => !excludeVaults.includes(String(a).toLowerCase()))

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