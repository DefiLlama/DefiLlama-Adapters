const ORION_CONFIG = '0xAba49f4eb48659fCb1f891b55D7a7b835C05af5E'

async function tvl(api) {
  const [transparent, encrypted] = await api.multiCall({
    target: ORION_CONFIG,
    abi: 'function getAllOrionVaults(uint8) view returns (address[])',
    calls: [0, 1],
  })
  const decommissioned = await api.call({ target: ORION_CONFIG, abi: 'address[]:getAllDecommissionedVaults' })
  return api.erc4626Sum2({ calls: [...transparent, ...encrypted, ...decommissioned] })
}

module.exports = {
  methodology:
    'TVL is the sum of accounted ERC-4626 totalAssets() (underlying notional AUM, not vault-contract token balances) across active vaults from OrionConfig.getAllOrionVaults(0) and getAllOrionVaults(1), plus getAllDecommissionedVaults. Excludes pending deposits, pendingVaultFees, and pendingProtocolFees.',
  ethereum: { tvl },
}
