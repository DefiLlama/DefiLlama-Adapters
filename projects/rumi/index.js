const addressProvider = "0xFf6c50B43382f2531FEF7d6382cCe1263B0585f1"

async function tvl(api) {
  const lendVaultAddress = await api.call({ abi: 'address:lendVault', target: addressProvider, });
  const tokens = await api.call({ abi: "address[]:getSupportedTokens", target: lendVaultAddress, });
  const bals = await api.multiCall({ abi: "function totalAssets(address) view returns (uint256)", target: lendVaultAddress, calls: tokens, })
  api.addTokens(tokens, bals)

  const vaults = await api.call({ abi: "address[]:getVaults", target: addressProvider, });
  const vTokens = await api.multiCall({ abi: "address:depositToken", calls: vaults, });
  const vBals = await api.multiCall({ abi: "uint256:balance", calls: vaults, });
  api.addTokens(vTokens, vBals)

  return api.getBalances()
}

module.exports = {
  methodology: 'Total asset value held in the Rumi lend vault and Rumi strategies',
  start: 143884813,
  arbitrum: {
    tvl: () => ({}),
  },
  // deadFrom: '2023-12-11',
}; 