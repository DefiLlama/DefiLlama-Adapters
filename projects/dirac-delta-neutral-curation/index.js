// Dirac Delta Neutral Curation — one of Dirac Finance's two curation modes.
//
// Curators deploy and manage delta-neutral DiracVault strategies through the
// DiracVaultFactory. TVL = sum of each vault's totalAssets() (ERC-4626, USDC),
// discovered dynamically each refresh via each factory's getDeployedVaults()
// (current + legacy generations) — no hardcoded vault list, new vaults are picked
// up automatically.
//
// The other mode is Morpho Vault V2 curation -> `dirac-classic-curation`.

// Delta-neutral DiracVault factories (current + legacy), per chain.
// Each exposes getDeployedVaults() -> address[].
const DN_FACTORIES = {
  base: [
    '0x1E367334f17ac318d8d8f5a696DE281AfC943FaC',
    '0x78e7B00B589c0b4281abdA0ec2cdaD5eb5A55F38',
  ],
  arbitrum: [
    '0xaf234cde60320e721d186ae5ecbbeb5d251eeb2e',
    '0x12b3f4094716b38697729e64527e21884f035e65',
    '0x1aeea6e35733b37f43f65c3156d88b36378518f1',
  ],
  polygon: [
    '0x78e7b00b589c0b4281abda0ec2cdad5eb5a55f38',
  ],
}

async function tvl(api) {
  const factories = DN_FACTORIES[api.chain] || []
  if (!factories.length) return

  // No permitFailure: a factory whose getDeployedVaults() query fails fails the
  // whole refresh rather than silently dropping that factory's vaults from the total.
  const lists = await api.multiCall({ abi: 'address[]:getDeployedVaults', calls: factories })
  const vaults = [...new Set(lists.flat())]
  if (!vaults.length) return

  // Every vault is ERC-4626: totalAssets() in its own asset() (USDC). No
  // permitFailure: a failed read fails the refresh rather than under-reporting.
  const [assets, tokens] = await Promise.all([
    api.multiCall({ abi: 'uint256:totalAssets', calls: vaults }),
    api.multiCall({ abi: 'address:asset', calls: vaults }),
  ])
  vaults.forEach((_, i) => api.add(tokens[i], assets[i]))
}

module.exports = {
  methodology:
    "Sums totalAssets() across every delta-neutral DiracVault, discovered dynamically each refresh via each DiracVaultFactory's getDeployedVaults() (current + legacy generations), denominated in each vault's underlying asset (USDC). One of Dirac Finance's two curation modes; the other is Morpho Vault V2 curation (dirac-classic-curation). Dirac also operates on Robinhood Chain (earn / Morpho-only, no delta-neutral stack).",
  base: { tvl },
  arbitrum: { tvl },
  polygon: { tvl },
}
