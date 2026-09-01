const registry = '0x7A5C5dbA4fbD0e1e1A2eCDBe752fAe55f6E842B3'

const abis = {
  farmRegistry: 'address:farmRegistry',
  getFarms: "function getFarms() external view returns (address[] memory)",
  assets: "function assets() external view returns (uint256)",
  assetToken: "function assetToken() external view returns (address)"
}

const tvl = async (api) => {
  const farmsRegistry = await api.call({ abi: abis.farmRegistry, target: registry })
  const farms = await api.call({ abi: abis.getFarms, target: farmsRegistry })
  const [balances, tokens] = await Promise.all([
    await api.multiCall({ calls: farms, abi: abis.assets }),
    await api.multiCall({ calls: farms, abi: abis.assetToken })
  ])

  farms.forEach((_, i) => {
    api.add(tokens[i], balances[i])
  })
}

module.exports = {
  methodology: 'TVL of the protocol is the value of all asssets deposited in the protocol kept in the accounting contract',
  ethereum: { tvl }
}