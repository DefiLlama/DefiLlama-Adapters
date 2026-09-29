const accounting = {
  ethereum: '0x7A5C5dbA4fbD0e1e1A2eCDBe752fAe55f6E842B3',
  base: '0x2ED079F04211baDA1a4e53F01782217334Cc28ce',
  monad: '0x386DfFb5a31588aB56Df20C54Ec649F3B554362C',
}

const abis = {
  farmRegistry: 'address:farmRegistry',
  getFarms: "function getFarms() external view returns (address[] memory)",
  assets: "function assets() external view returns (uint256)",
  assetToken: "function assetToken() external view returns (address)"
}

const tvl = async (api) => {
  const farmsRegistry = await api.call({ abi: abis.farmRegistry, target: accounting[api.chain] })
  const farms = await api.call({ abi: abis.getFarms, target: farmsRegistry })
  const [balances, tokens] = await Promise.all([
    api.multiCall({ calls: farms, abi: abis.assets }),
    api.multiCall({ calls: farms, abi: abis.assetToken }),
  ])

  farms.forEach((_, i) => {
    api.add(tokens[i], balances[i])
  })
}

module.exports = {
  methodology: 'TVL of the protocol is the value of all asssets deposited in the protocol kept in the accounting contract',
}

Object.keys(accounting).forEach((chain) => {
  module.exports[chain] = { tvl }
})
