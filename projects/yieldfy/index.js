// Yieldfy — ERC-4626 USDG vaults on Robinhood Chain.
//
// TVL = each vault's totalAssets(), NOT its USDG token balance. totalAssets()
// includes USDG the optimizer has routed out to an external venue (Morpho,
// Steakhouse), which a raw balanceOf would miss entirely.

const VAULTS = [
  '0x4a32cf41315DA5cDe593C56df35D7beFA40Cc01a', // Beta-1 — live vault
  '0x8f55eF1cd2B62197742c3E985DB1Cd0f63622e9F', // Beta-0 — retired 2026-07-22, still holds dust
]

const USDG = '0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168'

async function tvl(api) {
  const assets = await api.multiCall({ abi: 'uint256:totalAssets', calls: VAULTS })
  assets.forEach((amount) => api.add(USDG, amount))
}

module.exports = {
  methodology:
    'Counts USDG held by the Yieldfy vaults on Robinhood Chain, measured as the ERC-4626 ' +
    'totalAssets() of each vault. This includes USDG sitting idle in a vault and USDG the ' +
    'optimizer has routed into an external venue. Marked doublecounted because deployed USDG ' +
    'is also counted by the underlying venue protocols (Morpho, Steakhouse).',
  doublecounted: true,
  start: '2026-07-19',
  robinhood: { tvl },
}
