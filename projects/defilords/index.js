// DefiLords TVL Adapter
// Tracks all live ERC-4626 and LP vaults on Arbitrum One and Ethereum mainnet.
// Methodology: each vault's totalAssets() (ERC-4626) or getTVL() (LPVault) is the
// source of truth — no double-counting with adapters/routers.

const ARBITRUM_USDC = '0xaf88d065e77c8cc2239327c5edb3a432268e5831';
const ETHEREUM_USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

// ── Arbitrum One ERC-4626 vaults ─────────────────────────────────────────────
// totalAssets() returns USDC (6 dec) = idle USDC in vault + deployed capital via adapter.
// No double-counting: we only read the vault, never the adapter/router separately.
const ARBITRUM_4626_VAULTS = [
  '0x7d38Efeea2e5B16163e54CFf5564c73eBF852d12', // dlSTABLE  — Aave v3 USDC (audit-fixed)
  '0xfC05B8b787c952839134a4A45E92992dBD75DF2c', // dlNEUTRAL — Morpho Gauntlet USDC Core
  '0x73fc59c56Aa57da86a17c26d1fcc0846735AFd92', // dlGROWTH  — UniV3 USDC/WETH 0.05%
  '0x065f6d9A64d6703ABb036518f1Be60b01FD18dF4', // dlFLOW Balanced — UniV3 USDC/WETH 0.05%
  '0x401Cd98DD8457452a4EB09fD398211Cf2d2E503e', // dlFLOW Hybrid V2 — Phase 2 (live)
  '0xc997E2771e22f66f47EE98DDa55434410298cCDb', // dlFLOW Hybrid V1 — retired, still holds user funds
];

// ── Arbitrum One LPVault ──────────────────────────────────────────────────────
// Uses getTVL() (returns USDC-equivalent of the full UniV3 position + idle).
const LP_VAULT = '0x333309cf4A411Ee561BA739942776e03DA597018'; // dlLP v2 — ERC-721 receipt NFT

// ── Ethereum mainnet ERC-4626 vaults ─────────────────────────────────────────
const ETHEREUM_4626_VAULTS = [
  '0x79a3C841Ec0A1365dd41B17b4d171a5027e81850', // dlSTABLE mainnet — Aave + Morpho + Ethena
];

async function arbitrumTvl(api) {
  // ERC-4626 vaults: totalAssets() → raw USDC (6 dec)
  const assets = await api.multiCall({
    abi: 'function totalAssets() view returns (uint256)',
    calls: ARBITRUM_4626_VAULTS,
  });
  assets.forEach(amt => api.add(ARBITRUM_USDC, amt));

  // LPVault: getTVL() → raw USDC-equivalent (6 dec, priced via sqrtPriceX96)
  const lpTvl = await api.call({
    abi: 'function getTVL() view returns (uint256)',
    target: LP_VAULT,
  });
  api.add(ARBITRUM_USDC, lpTvl);
}

async function ethereumTvl(api) {
  const assets = await api.multiCall({
    abi: 'function totalAssets() view returns (uint256)',
    calls: ETHEREUM_4626_VAULTS,
  });
  assets.forEach(amt => api.add(ETHEREUM_USDC, amt));
}

module.exports = {
  methodology:
    'TVL is the sum of all assets held by live DefiLords vaults. ' +
    'ERC-4626 vaults report via totalAssets() (idle USDC + deployed LP/lending capital). ' +
    'The LPVault reports via getTVL() (USDC-equivalent of the UniV3 position). ' +
    'No double-counting: vaults are the source of truth; adapters/routers are excluded.',
  arbitrum: { tvl: arbitrumTvl },
  ethereum: { tvl: ethereumTvl },
};
