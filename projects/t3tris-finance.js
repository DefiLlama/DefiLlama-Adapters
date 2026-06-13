/**
 * T3tris Finance - TVL Adapter
 *
 * T3tris Finance is a vault protocol featuring ERC4626-compliant vaults
 * with sync/async deposit flows, silos for asset custody, and strategies
 * routing into underlying yield sources (e.g., AAVE stataTokens).
 *
 * TVL is calculated by enumerating all vaults deployed via the T3tris
 * factory contract and summing their getGrossTVL() components per vault:
 *
 *   - totalManagedAssets: assets actively deployed in strategies (oracle NAV)
 *   - pendingDeposits:    async deposit requests sitting in depositSilo
 *   - claimableRedeems:   settled redemptions waiting to be claimed from redeemSilo
 *
 * All three components represent user assets under the protocol's custody.
 * They are reported separately per token via api.add() for transparency,
 * though DefiLlama sums them into a single TVL figure per token.
 *
 * The protocol address is deterministic (CREATE3) and identical on all chains.
 */

// T3tris protocol v1 proxy — deterministic CREATE3 address, same on all EVM chains
const T3TRIS_FACTORY = "0x0000000000CC53b5Fd649b80f08b05405779cC71";

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
  // The protocol proxy has a deterministic address but is only deployed on a
  // subset of chains (Arbitrum for now). On chains without the contract, the
  // call reverts — treat that as zero TVL for this chain.
  let count;
  try {
    count = await api.call({
      abi: ABI.getDeployedVaultsCount,
      target: T3TRIS_FACTORY,
    });
  } catch {
    return {};
  }

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

  // Get grossTVL breakdown for each vault
  const grossTvls = await api.multiCall({
    abi: ABI.getGrossTVL,
    calls: vaults,
    permitFailure: true,
  });

  // Add each TVL component separately per underlying token
  // DefiLlama sums all api.add() calls per token into one TVL figure,
  // but breaking them out makes the adapter logic transparent.
  for (let i = 0; i < vaults.length; i++) {
    if (!assets[i] || !grossTvls[i]) continue;
    const token = assets[i];
    const totalManagedAssets = grossTvls[i].totalManagedAssets || grossTvls[i][0];
    const pendingDeposits = grossTvls[i].pendingDeposits || grossTvls[i][1];
    const claimableRedeems = grossTvls[i].claimableRedeems || grossTvls[i][2];

    // Assets actively deployed in strategies (oracle NAV)
    if (totalManagedAssets) api.add(token, totalManagedAssets);
    // Async deposit requests sitting in depositSilo (yield-bearing)
    if (pendingDeposits) api.add(token, pendingDeposits);
    // Settled redemptions awaiting claim from redeemSilo (yield-bearing)
    if (claimableRedeems) api.add(token, claimableRedeems);
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
    "TVL = totalManagedAssets (assets deployed in strategies, per oracle NAV) + pendingDeposits (async deposit requests in yield-bearing depositSilo) + claimableRedeems (settled redemptions in yield-bearing redeemSilo). Each component is tracked per vault via getGrossTVL() and summed per underlying token.",
};

chains.forEach((chain) => {
  module.exports[chain] = { tvl };
});
