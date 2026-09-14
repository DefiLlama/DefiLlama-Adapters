const VAULT_FACTORY = '0x2dFEf33491D26bed6e363F711E5CDd59b812e76c'
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

const abi = {
  getVaults:
    'function getVaults() view returns ((uint256 vaultId,address vaultAddress,string vaultName,address vaultConfigStoreAddress,address vaultConfigAddress,address vaultStoreAddress,address redeemVaultAddress,address epochManagerStoreAddress,address epochManagerAddress,uint8 status,address deployer,uint256 deployedAt)[])',
  underlyingAssetList: 'address[]:underlyingAssetList',
  totalValueLockedByAsset: 'function totalValueLockedByAsset(address) view returns (uint256)',
}

async function tvl(api) {
  const vaults = await api.call({ target: VAULT_FACTORY, abi: abi.getVaults })
  const activeVaults = vaults.filter(
    (vault) =>
      vault.vaultConfigAddress &&
      vault.vaultConfigAddress !== ZERO_ADDRESS &&
      vault.vaultStoreAddress &&
      vault.vaultStoreAddress !== ZERO_ADDRESS
  )

  if (!activeVaults.length) return

  const assetLists = await api.multiCall({
    calls: activeVaults.map((vault) => vault.vaultConfigAddress),
    abi: abi.underlyingAssetList,
  })

  const tvlCalls = []
  assetLists.forEach((assets, index) => {
    assets.forEach((asset) => {
      if (asset && asset !== ZERO_ADDRESS) {
        tvlCalls.push({
          target: activeVaults[index].vaultStoreAddress,
          params: [asset],
        })
      }
    })
  })

  if (!tvlCalls.length) return

  const balances = await api.multiCall({
    calls: tvlCalls,
    abi: abi.totalValueLockedByAsset,
  })

  tvlCalls.forEach((call, index) => api.add(call.params[0], balances[index]))
}

module.exports = {
  doublecounted: true,
  methodology:
    "TVL reflects the aggregate principal value of outstanding LP Tokens issued by Dow Protocol vaults on BNB Smart Chain. Capital providers subscribe stablecoins (USDT/USDC) and receive LP Tokens representing their principal. The adapter calculates this value using the protocol's canonical VaultStore accounting by summing totalValueLockedByAsset(asset) for each supported underlying asset across active vaults.",
  bsc: {
    tvl,
  },
}
