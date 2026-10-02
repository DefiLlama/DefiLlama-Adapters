const ORION_CONFIG = '0xAba49f4eb48659fCb1f891b55D7a7b835C05af5E'

async function tvl(api) {
  const [transparent, encrypted] = await Promise.all([
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
  ])
  const vaults = [...transparent, ...encrypted]
  if (!vaults.length) return {}
  return api.erc4626Sum2({ calls: vaults })
}

module.exports = {
  methodology:
    'TVL is the sum of ERC-4626 totalAssets() across all Orion vaults returned by OrionConfig.getAllOrionVaults(0) and getAllOrionVaults(1).',
  ethereum: { tvl },
}
