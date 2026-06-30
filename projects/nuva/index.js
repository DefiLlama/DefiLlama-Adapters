/**
 * NUVA — nvYLDS (Provenance vault module) + nvPRIME (Ethereum DedicatedVaultRouter)
 *
 * Phase 0 decisions (Product #401):
 * - nvYLDS TVL: Provenance total_vault_value only (no Eth/Base bridge double-count)
 * - nvPRIME TVL: Ethereum router underlying assets (ERC4626 hop chain)
 *
 * Prod refs: nuva-config mainnet/ethereum/ignition/deployments/nvprime, nuva-app values-prod.yaml
 */
const { get } = require('../helper/http')
const { sumTokens2 } = require('../helper/unwrapLPs')

const PROVENANCE_VAULT_API = 'https://api.provenance.io'
const NVYLDS_SHARE_DENOM = 'nuva.ylds'
const NVPRIME_ROUTER = '0x50AE1e4A612A4623b747aEeFb30aFBA82804e12c'

const ERC4626_CONVERT_ABI =
  'function convertToAssets(uint256 shares) view returns (uint256 assets)'

async function fetchNvyldsTotalVaultValueMicro() {
  const data = await get(
    `${PROVENANCE_VAULT_API}/vault/v1/vaults/${encodeURIComponent(NVYLDS_SHARE_DENOM)}`
  )
  const amount = data?.total_vault_value?.amount
  if (!amount) {
    throw new Error(`nvYLDS total_vault_value missing for ${NVYLDS_SHARE_DENOM}`)
  }
  return BigInt(amount)
}

async function provenanceTvl(api) {
  const totalVaultValueMicro = await fetchNvyldsTotalVaultValueMicro()
  // Matches nuva-app: total_vault_value amount is USD-equivalent with 6 decimals.
  api.addUSDValue(Number(totalVaultValueMicro) / 1e6)
}

async function resolveDedicatedRouterBaseAssets(api, router) {
  const assetVaultAddress = await api.call({
    target: router,
    abi: 'address:assetVault',
  })
  const stakingVaultAddress = await api.call({
    target: router,
    abi: 'address:stakingVault',
  })
  const nuvaVaultAddress = await api.call({
    target: router,
    abi: 'address:nuvaVault',
  })

  const stakingVaultShares = await api.call({
    target: nuvaVaultAddress,
    abi: 'uint256:totalAssets',
  })

  const assetVaultShares = await api.call({
    target: stakingVaultAddress,
    abi: ERC4626_CONVERT_ABI,
    params: [stakingVaultShares],
  })

  const baseAsset = await api.call({
    target: assetVaultAddress,
    abi: 'address:asset',
  })

  const baseAssets = await api.call({
    target: assetVaultAddress,
    abi: ERC4626_CONVERT_ABI,
    params: [assetVaultShares],
  })

  return { baseAsset, baseAssets }
}

async function ethereumTvl(api) {
  const { baseAsset, baseAssets } = await resolveDedicatedRouterBaseAssets(
    api,
    NVPRIME_ROUTER
  )
  api.add(baseAsset, baseAssets)
  return sumTokens2({ api })
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  start: '2026-04-27',
  methodology:
    'NUVA TVL is the sum of (1) nvYLDS total_vault_value from the Provenance vault module (canonical vault state; Ethereum and Base bridge contracts are excluded to avoid double-counting bridged deposits) and (2) nvPRIME underlying assets held in the Ethereum DedicatedVaultRouter ERC4626 hop chain (nuvaVault → stakingVault → assetVault), priced at the base asset token.',
  provenance: { tvl: provenanceTvl },
  ethereum: { tvl: ethereumTvl },
}
