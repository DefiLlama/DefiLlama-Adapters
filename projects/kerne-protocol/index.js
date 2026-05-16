// Kerne Protocol — DefiLlama TVL Adapter
// ============================================================
// Protocol: Kerne (https://kerne.fi)
// Chain:    Base (chainId 8453)
//
// Surfaces counted as TVL:
//   1. KerneVault.totalAssets()             (ERC-4626; underlying = WETH)
//   2. USDC.balanceOf(KUSDPSM)              (PSM USDC reserves backing kUSD)
//
// Why both: Kerne runs two distinct on-chain deposit surfaces with
// different underlying assets. The KerneVault holds WETH backing kLP
// shares; the KUSDPSM holds USDC backing outstanding kUSD 1:1. Both
// are real protocol-controlled assets that depositors can redeem. We
// do NOT add the kUSD supply itself, which would double-count the PSM
// USDC reserves that already back it.
//
// Contracts (verified on Basescan):
//   KerneVault:   https://basescan.org/address/0x8005bc7A86AD904C20fd62788ABED7546c1cF2AC#code
//   KUSDPSM:      https://basescan.org/address/0xFf3025ec18e301855aB0f36Ec6ECa115a29A5Fbc#code
//   kUSD:         https://basescan.org/address/0x5C2EfdF0D8D286959b42308966bc2B97f5680AA3#code
//   USDC (Base):  0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
//   WETH (Base):  0x4200000000000000000000000000000000000006
//
// Reviewer note on the absolute TVL number: Kerne is in its mainnet
// launch window. The vault holds a small WETH seed and the PSM holds
// the USDC backing the first round of kUSD mints. The adapter is
// future-proof: as both surfaces grow, the TVL accumulates without
// any further code changes.
//
// This adapter supersedes earlier closed drafts (PRs #17578, #17590,
// #17645, #17648, #17674, #17910). It uses the canonical @defillama/sdk
// ChainApi pattern (api.batchCall + api.add) with no third-party
// runtime dependencies (no viem, no axios, no off-chain API).

const KERNE_VAULT = '0x8005bc7A86AD904C20fd62788ABED7546c1cF2AC';
const KUSD_PSM = '0xFf3025ec18e301855aB0f36Ec6ECa115a29A5Fbc';
const USDC_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

async function tvl(api) {
  const [totalAssets, asset, psmUsdc] = await api.batchCall([
    { target: KERNE_VAULT, abi: 'uint256:totalAssets' },
    { target: KERNE_VAULT, abi: 'address:asset' },
    { target: USDC_BASE, abi: 'erc20:balanceOf', params: [KUSD_PSM] },
  ]);
  api.add(asset, totalAssets);
  api.add(USDC_BASE, psmUsdc);
}

module.exports = {
  methodology:
    'TVL is the sum of two on-chain surfaces on Base: (1) KerneVault.totalAssets() in its underlying asset (WETH), and (2) USDC reserves held by the KUSDPSM contract backing outstanding kUSD 1:1. The vault WETH backs kLP shares; the PSM USDC backs kUSD. Both are protocol-controlled deposit surfaces. The kUSD supply itself is NOT added, because counting it would double-count the PSM USDC reserves that already back it.',
  base: { tvl },
};
