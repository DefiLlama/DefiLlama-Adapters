const axios = require('axios')

const URL = 'https://apy.api.concrete.xyz/v1/vault:tvl/all'

const abis = {
  asset: "address:asset",
  totalAssets: "uint256:totalAssets",
  getStrategies: "function getStrategies() view returns ((address strategy, (uint256 index, uint256 amount) allocation)[])"
}

const tvl = async (api) => {
  const chainId = api.chainId
  const { data } = await axios.get(URL)
  const datas = Object.values(data[chainId]).map(v => v.address)

  const [assets, strategiess] = await Promise.all([
    api.multiCall({ calls: datas, abi: abis.asset }),
    api.multiCall({ calls: datas, abi: abis.getStrategies }),
  ])

  const vaults = datas.map((d, i) => {
    const asset = assets[i]
    const strategies = strategiess[i].map(({ strategy }) => strategy)
    return { vault: d, asset, strategies }
  })

  for (const { asset, strategies } of vaults) {
    const totalAssets = await api.multiCall({ calls: strategies, abi: abis.totalAssets })
    totalAssets.forEach((t) => { api.add(asset, t) })
  }
} 

const chains = ['ethereum', 'berachain', 'arbitrum', 'katana']
chains.forEach((chain) => {
  module.exports[chain] = { tvl }
})