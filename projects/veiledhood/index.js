// VeiledHood — privacy vaults on Robinhood Chain.
// Both contracts hold user-deposited USDG/WETH; per-user balances live off-chain
// and are committed via a Merkle root, but the vault's ERC-20 balances are public
// on-chain reads, so TVL can be derived without any private state.
const VAULTS = [
  "0x8Ae2D8A767c3d59219556b83d4e8385514b6d72B", // Veiledhood — deposit/withdraw vault
  "0xa4B90fb94B2bBdf1D66A8191E883D0F57BbC6D0b", // VeilSwap — swap settlement vault
];

const TOKENS = [
  "0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168", // USDG
  "0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73", // WETH
];

async function tvl(api) {
  await api.sumTokens({ owners: VAULTS, tokens: TOKENS });
}

module.exports = {
  methodology:
    "TVL is the sum of USDG and WETH balances held by VeiledHood's Veiledhood and VeilSwap vault contracts on Robinhood Chain, read directly on-chain. Per-user balances are tracked off-chain via a Merkle-committed ledger, but the vault's aggregate token balances are public and require no private state to compute.",
  robinhood: {
    tvl,
  },
};
