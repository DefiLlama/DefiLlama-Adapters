// Kerne Protocol — DefiLlama TVL Adapter
// ============================================================
// Protocol: Kerne (https://kerne.fi)
// Chain:    Base (chainId 8453)
//
// Surface counted as TVL:
//   - KerneVault.totalAssets()   (ERC-4626; underlying asset = WETH)
//
// Why only the vault: the protocol's user-facing stablecoin (kUSD) is
// minted from USDC 1:1 by the PSM, downstream of the WETH-collateralised
// vault. Counting kUSD too would double-count protocol-issued debt
// against the same underlying collateral.
//
// Contracts (verified on Basescan):
//   KerneVault:   https://basescan.org/address/0x8005bc7A86AD904C20fd62788ABED7546c1cF2AC#code
//   underlying:   0x4200000000000000000000000000000000000006 (WETH)
//
// This adapter supersedes earlier closed drafts (PRs #17578, #17590,
// #17645, #17648, #17674, #17910). It uses the canonical @defillama/sdk
// ChainApi pattern (api.batchCall + api.add) with no third-party
// runtime dependencies (no viem, no axios, no off-chain API).

const KERNE_VAULT = '0x8005bc7A86AD904C20fd62788ABED7546c1cF2AC';

async function tvl(api) {
  const [totalAssets, asset] = await api.batchCall([
    { target: KERNE_VAULT, abi: 'uint256:totalAssets' },
    { target: KERNE_VAULT, abi: 'address:asset' },
  ]);
  api.add(asset, totalAssets);
}

module.exports = {
  methodology:
    'TVL is the WETH balance reported by KerneVault.totalAssets() on Base. The vault is ERC-4626 with WETH (0x4200000000000000000000000000000000000006) as the underlying asset. Only the on-chain underlying token is counted. The protocol-issued kUSD stablecoin and off-chain hedging accounting are NOT double-counted.',
  base: { tvl },
};
