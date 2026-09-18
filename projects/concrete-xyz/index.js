const { getConfig } = require('../helper/cache')

const URL = 'https://apy.api.concrete.xyz/v1/vault:tvl/all'

const abis = {
  asset: "address:asset",
  totalAssets: "uint256:totalAssets",
  cachedTotalAssets: "uint256:cachedTotalAssets",
  // getStrategies: "function getStrategies() view returns ((address strategy, (uint256 index, uint256 amount) allocation)[])"
}

const excludeVaults = [
  '0x4def5abcfba7babe04472ee4835f459daf4bd45f',
  '0x5854c7693459c6e316a96565776b72d94ee0e5fd',
  '0xb04e166fd5d7078bb7b3412406609fd92855a08f',
  '0x38f20ad5a233c1b2c91ce987853ff3201540db53',
]

const tvl = async (api) => {
  const chainId = api.chainId
  const data = await getConfig('concrete-xyz/vaults', URL)
  // exclude test vaults and vaults with no tvl (onchain totalAssets() may be stale)
  const vaults = Object.values(data[chainId]).filter(v => v.address && Number(v.tvl) > 0 && !excludeVaults.includes(v.address.toLowerCase()))

  const addresses = vaults.map(v => v.address)
  const assets = await api.multiCall({ calls: addresses, abi: abis.asset })
  const totalAssets = await api.multiCall({ calls: addresses, abi: abis.totalAssets, permitFailure: true })
  // V2 totalAssets() reverts while the vault's accounting is stale or the vault is paused; cachedTotalAssets()
  // is the last valuation the vault accepted. V1 vaults have no cache, so those stay excluded.
  const stale = addresses.map((address, i) => (totalAssets[i] === null ? address : null)).filter(Boolean)
  const cached = await api.multiCall({ calls: stale, abi: abis.cachedTotalAssets, permitFailure: true })
  stale.forEach((address, j) => { totalAssets[addresses.indexOf(address)] = cached[j] })

  let apiTvl = 0
  for (let i = 0; i < vaults.length; i++) {
    if (!totalAssets[i]) continue;
    api.add(assets[i], totalAssets[i])
    apiTvl += Number(vaults[i].tvl)
  }

  // throws if onchain tvl is >10% above API tvl (not thrown on historic runs since api tvl is always current)
  if (!api.timestamp || api.timestamp > Date.now() / 1e3 - 3600) {
    const onchainTvl = await api.getUSDValue()
    if (onchainTvl > apiTvl * 1.1) throw new Error(`concrete-xyz ${api.chain}: onchain TVL $${onchainTvl.toFixed(0)} is >10% above API TVL $${apiTvl.toFixed(0)}`)
  }
}

const chains = ['ethereum', 'berachain', 'arbitrum', 'katana', 'stable']
chains.forEach((chain) => {
  module.exports[chain] = { tvl }
})