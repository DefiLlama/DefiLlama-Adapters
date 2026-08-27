const { sumERC4626VaultsExport2 } = require('../helper/erc4626')

const config = {
  klaytn: {
    // Super Vaults whose token() (the CooldownVault share) DefiLlama already
    // prices, so totalAssets() can be reported in that share directly.
    vaults: [
      '0x2e4e573D86c70688cD97D76bc5DDc1Bb265bF5D6', // Super Vault (EarnUSDT) -> seCDV
    ],
    // Super Vaults whose CooldownVault share is NOT priced by DefiLlama. Reporting
    // totalAssets() in that share would silently contribute zero, so the share is
    // unwrapped one more hop into the CooldownVault's own asset(), which is priced.
    // Same two-layer structure as EarnUSDT: SuperVault -> CooldownVault share -> asset.
    unwrappedVaults: [
      {
        vault: '0x1dc3De9fA858B4F9c6bA9EBEA9B5150b09280dd9',        // Super Vault JPYC (EarnJPYC)
        cooldownVault: '0x632e099A74ed961f3C284c6E5E16641B75c1A09D', // seCDV-JPYC
        asset: '0xe7c3D8C9a439FeDE00d2600032D5db0be71C3c29',        // JPYC (JPY Coin), 18 decimals
      },
    ],
  },
}

// EarnJPYC holds seCDV-JPYC, which DefiLlama has no price for. Convert the Super
// Vault's totalAssets() from CooldownVault shares into the underlying asset via the
// CooldownVault's own ERC-4626 convertToAssets(), then report the asset. The rate is
// READ, never assumed: it is 1:1 while the CooldownVault has accrued nothing, but a
// hardcoded 1 would silently understate TVL the moment it accrues.
function unwrappedVaultsTvl(vaults) {
  return async (api) => {
    const shares = await api.multiCall({
      abi: 'uint256:totalAssets',
      calls: vaults.map((v) => v.vault),
    })
    const assets = await api.multiCall({
      abi: 'function convertToAssets(uint256) view returns (uint256)',
      calls: vaults.map((v, i) => ({ target: v.cooldownVault, params: [shares[i]] })),
    })
    vaults.forEach((v, i) => api.add(v.asset, assets[i]))
  }
}

module.exports = {
  methodology:
    'TVL is the sum of totalAssets() across SuperEarn Super Vaults on Kaia. Each Super Vault holds a CooldownVault share (seCDV) as its underlying. EarnUSDT is reported in seCDV directly; EarnJPYC is reported in JPYC, converted from seCDV-JPYC through the CooldownVault own convertToAssets() because seCDV-JPYC has no price feed.',
}

for (const chain of Object.keys(config)) {
  const { vaults = [], unwrappedVaults = [] } = config[chain]
  const priced = sumERC4626VaultsExport2({ vaults, tokenAbi: 'address:token', balanceAbi: 'uint256:totalAssets' })
  const unwrapped = unwrappedVaultsTvl(unwrappedVaults)
  module.exports[chain] = {
    tvl: async (api) => {
      await priced(api)
      await unwrapped(api)
      return api.getBalances()
    },
  }
}
