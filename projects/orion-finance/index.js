const ORION_CONFIG = '0xAba49f4eb48659fCb1f891b55D7a7b835C05af5E'

async function tvl(api) {
  const [transparent, encrypted, decommissioned] = await Promise.all([
    api.call({
      target: ORION_CONFIG,
      abi: 'function getAllOrionVaults(uint8) view returns (address[])',
      params: [0],
    }),
    api.call({
      target: ORION_CONFIG,
      abi: 'function getAllOrionVaults(uint8) view returns (address[])',
      params: [1],
    }),
    api.call({
      target: ORION_CONFIG,
      abi: 'address[]:getAllDecommissionedVaults',
    }),
  ])

  const activeVaults = [...transparent, ...encrypted]
  const activeSet = new Set(activeVaults.map((a) => a.toLowerCase()))
  const decommissionedVaults = decommissioned.filter((a) => !activeSet.has(a.toLowerCase()))
  const vaults = [...activeVaults, ...decommissionedVaults]

  if (!vaults.length) return {}
  return api.erc4626Sum2({ calls: vaults })
}

module.exports = {
  methodology:
    'TVL is the sum of ERC-4626 totalAssets() across active Orion vaults from getAllOrionVaults(0) and getAllOrionVaults(1), plus totalAssets() of vaults from getAllDecommissionedVaults.',
  ethereum: { tvl },
}
