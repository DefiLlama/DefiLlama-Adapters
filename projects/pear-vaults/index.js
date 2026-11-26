const factory = '0x038b9e0eef0f926682d3a9b1918611efec9cc741'

async function tvl(api) {
  const vaults = await api.fetchList({ lengthAbi: 'uint256:getVaultCount', itemAbi: 'function getVault(uint256) view returns (address)', target: factory })
  return api.erc4626Sum({ calls: vaults, isOG4626: true, permitFailure: true })
}

module.exports = {
  methodology: 'Sum of totalAssets() across all Pear vaults deployed by the vault factory on HyperEVM. Deposited USDC is moved to HyperCore trading accounts and valued on-chain by the vault contract.',
  doublecounted: true, // idle USDC in the HyperCore trading accounts is supplied to Hyperliquid Earn
  hyperliquid: { tvl },
}
