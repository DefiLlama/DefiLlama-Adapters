const accounting = {
  ethereum: '0x7A5C5dbA4fbD0e1e1A2eCDBe752fAe55f6E842B3',
  base: '0x2ED079F04211baDA1a4e53F01782217334Cc28ce',
  monad: '0x386DfFb5a31588aB56Df20C54Ec649F3B554362C',
}

// L1 mirror farms for Outland Base / Monad — assets are counted on those L2 chains
const ethereumOutlandMirrorFarms = new Set([
  '0xbD6c2d1C4809a5D8847FbA3a3cf7d6BDf6b6C3bA',
  '0xA7c1DAEAA5D97e1319B4Ff6Cdf658F5C4582A27E',
].map((a) => a.toLowerCase()))

const abis = {
  farmRegistry: 'address:farmRegistry',
  getFarms: "function getFarms() external view returns (address[] memory)",
  assets: "function assets() external view returns (uint256)",
  assetToken: "function assetToken() external view returns (address)"
}

const tvl = async (api) => {
  const farmsRegistry = await api.call({ abi: abis.farmRegistry, target: accounting[api.chain] })
  let farms = await api.call({ abi: abis.getFarms, target: farmsRegistry })
  // exclude L1 mirror farms if on Ethereum
  if(api.chain === 'ethereum') {
    farms = farms.filter((farm) => !ethereumOutlandMirrorFarms.has(farm.toLowerCase()))
  }

  const [balances, tokens] = await Promise.all([
    api.multiCall({ calls: farms, abi: abis.assets }),
    api.multiCall({ calls: farms, abi: abis.assetToken }),
  ])

  farms.forEach((_, i) => {
    api.add(tokens[i], balances[i])
  })
}

module.exports = {
  methodology:
    'Sums assets() across farms registered in each chain Accounting contract. On Ethereum, L1 Outland mirror farms for Base and Monad are excluded because the same assets are counted on those L2 chains.',
}

Object.keys(accounting).forEach((chain) => {
  module.exports[chain] = { tvl }
})
