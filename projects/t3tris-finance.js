/**
 * T3tris Finance - TVL Adapter
 *
 * T3tris Finance is a vault protocol featuring ERC4626-compliant vaults
 * with sync/async deposit flows, silos for asset custody, and strategies
 * routing into underlying yield sources (e.g., AAVE stataTokens).
 *
 * TVL is calculated by enumerating all vaults deployed via the T3tris
 * factory contract and summing their grossTVL from getGrossTVL().
 * grossTVL = totalManagedAssets + pendingDeposits + claimableRedeems,
 * providing the most complete picture of assets under management.
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
  asset: "function asset() external view returns (address)",
  getGrossTVL:
    "function getGrossTVL() external view returns (uint256 totalManagedAssets, uint256 pendingDeposits, uint256 claimableRedeems, uint256 grossTVL)",
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

  // Get underlying asset for each vault
  const assets = await api.multiCall({
    abi: ABI.asset,
    calls: vaults,
    permitFailure: true,
  });

  // Get grossTVL for each vault (totalManagedAssets + pendingDeposits + claimableRedeems)
  const grossTvls = await api.multiCall({
    abi: ABI.getGrossTVL,
    calls: vaults,
    permitFailure: true,
  });

  // Sum balances per underlying token
  for (let i = 0; i < vaults.length; i++) {
    if (!assets[i] || !grossTvls[i]) continue;
    // getGrossTVL returns (totalManagedAssets, pendingDeposits, claimableRedeems, grossTVL)
    // grossTVL is the 4th element (index 3)
    const grossTvl = grossTvls[i].grossTVL || grossTvls[i][3];
    if (grossTvl) {
      api.add(assets[i], grossTvl);
    }
  }

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
  "xdai",
  "fantom",
  "sonic",
];

module.exports = {
  methodology:
    "TVL is calculated by summing the grossTVL (totalManagedAssets + pendingDeposits + claimableRedeems) of all T3tris vaults deployed through the protocol factory, providing the complete picture of assets under management.",
};

chains.forEach((chain) => {
  module.exports[chain] = { tvl };
});
