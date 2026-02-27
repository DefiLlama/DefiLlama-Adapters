/**
 * T3tris Finance - TVL Adapter
 *
 * T3tris Finance is a vault protocol featuring ERC4626-compliant vaults
 * with sync/async deposit flows, silos for asset custody, and strategies
 * routing into underlying yield sources (e.g., AAVE stataTokens).
 *
 * TVL is calculated by enumerating all vaults deployed via the T3tris
 * factory contract and summing their totalAssets().
 *
 * The factory address is deterministic (CREATE3) and identical on all chains.
 */

// T3tris protocol factory — deterministic CREATE3 address, same on all EVM chains
const T3TRIS_FACTORY = "0x7DD63c4eE5CD277B7870155371a6d62A2f7b1652";

const ABI = {
  getDeployedVaultsCount:
    "function getDeployedVaultsCount() external view returns (uint256)",
  getDeployedVaults:
    "function getDeployedVaults(uint256 fromIndex, uint256 toIndex) external view returns (address[])",
};

async function tvl(api) {
  // Get number of deployed vaults from the factory
  const count = await api.call({
    abi: ABI.getDeployedVaultsCount,
    target: T3TRIS_FACTORY,
  });

  if (count == 0) return {};

  // Fetch all vault addresses in a single call
  const vaults = await api.call({
    abi: ABI.getDeployedVaults,
    target: T3TRIS_FACTORY,
    params: [0, count - 1],
  });

  if (!vaults || vaults.length === 0) return {};

  // Each vault is ERC4626 — use the native helper to sum
  // asset() returns the underlying token, totalAssets() the balance
  await api.erc4626Sum({
    calls: vaults,
    tokenAbi: "address:asset",
    balanceAbi: "uint256:totalAssets",
    permitFailure: true,
  });

  return api.getBalances();
}

// Chains where T3tris will be deployed (deterministic address on all)
const chains = [
  "ethereum",
  "arbitrum",
  "base",
  "optimism",
  "polygon",
  "avax",
  "bsc",
  "linea",
  "scroll",
  "blast",
  "mantle",
  "mode",
  "gnosis",
  "fantom",
  "sonic",
];

module.exports = {
  methodology:
    "TVL is calculated by summing the totalAssets() of all T3tris vaults deployed through the protocol factory. Underlying vault assets are routed through silos into yield strategies (e.g., AAVE stataTokens), so TVL is double-counted with the underlying protocol.",
  doublecounted: true,
};

chains.forEach((chain) => {
  module.exports[chain] = { tvl };
});
