const { getConfig } = require('../helper/cache')

const TVL_ENDPOINT = 'https://api.cheomayield.xyz/api/tvl'

// Fallback registry — mirrors `TVL_VAULTS` in the CheomaYield points-server.
// Used only if the /api/tvl endpoint is unreachable or returns no vaults.
// token addresses are DefiLlama coreAssets (USDC on Base, USDG on Robinhood 4663).
const FALLBACK_VAULTS = [
  { chain: 'base', address: '0xadaacbfda2ab1744b804f241e81533187a0da843', token: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' }, // wave1 — USDC
  { chain: 'robinhood', address: '0xd487e29c9f628395252707f72b220eB9D9afECBB', token: '0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168' }, // giwa — USDG
]

// Map CheomaYield's internal chain names to DefiLlama chain ids + coreAssets token addresses.
const TOKEN_BY_CHAIN = {
  base: { USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' },
  robinhood: { USDG: '0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168' },
}

async function tvl(api) {
  const chain = api.chain
  let vaults = []

  // Single source of truth: CheomaYield's own aggregated TVL endpoint enumerates every live
  // mainnet vault (chain + address + deposit asset). TVL is still measured on-chain below.
  try {
    const data = await getConfig('cheomayield/tvl', TVL_ENDPOINT)
    if (data && Array.isArray(data.vaults)) {
      vaults = data.vaults.filter(v => v.chain === chain)
    }
  } catch (e) {
    // fall through to fallback registry
  }

  if (!vaults.length) {
    vaults = FALLBACK_VAULTS.filter(v => v.chain === chain).map(v => ({ ...v, token: undefined, _token: v.token }))
  }

  for (const v of vaults) {
    // Resolve the deposit-asset token address: prefer the on-chain `asset()`/`token()` getter,
    // fall back to the coreAssets address keyed by the vault's declared token symbol.
    let token = v._token || (v.token && TOKEN_BY_CHAIN[chain]?.[v.token])

    if (!token) {
      token = await api.call({ abi: 'address:asset', target: v.address }).catch(() => null)
    }

    if (!token) continue

    // totalAssets() = principal + accrued yield, the true value locked (vs totalSupply which
    // is only receipt-token / principal supply).
    const totalAssets = await api.call({ abi: 'uint256:totalAssets', target: v.address }).catch(() => null)
    if (totalAssets != null) api.add(token, totalAssets)
  }
}

module.exports = {
  methodology:
    'TVL is the sum of totalAssets() (principal + accrued yield) across all CheomaYield pre-deposit vaults, measured on-chain. Vault list is sourced from api.cheomayield.xyz/api/tvl (single source of truth), with USDC vaults on Base and USDG vaults on Robinhood.',
  timetravel: false,
  base: { tvl },
  robinhood: { tvl },
}
