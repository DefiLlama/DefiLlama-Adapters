/**
 * T3tris Finance - TVL Adapter
 *
 * T3tris Finance is a vault protocol featuring ERC4626-compliant vaults
 * with sync/async deposit flows, silos for asset custody, and strategies
 * routing into underlying yield sources (e.g., AAVE stataTokens).
 *
 * TVL is sourced from the T3tris ecosystem API
 * (https://ecosystem.t3tris.finance/vaults), which lists every vault with
 * `verified` and `blacklisted` curation flags. Only vaults that are `verified`
 * and not `blacklisted` are indexed. For each such vault we read its on-chain
 * getGrossTVL() and sum the components per underlying token:
 *
 *   - totalManagedAssets: assets actively deployed in strategies (oracle NAV)
 *   - pendingDeposits:    async deposit requests sitting in depositSilo
 *   - claimableRedeems:   settled redemptions waiting to be claimed from redeemSilo
 *
 * All three components represent user assets under the protocol's custody.
 * They are reported separately per token via api.add() for transparency,
 * though DefiLlama sums them into a single TVL figure per token.
 *
 * Landing: https://t3tris.finance/   App: https://app.t3tris.finance/
 */

const { getConfig } = require("./helper/cache");

// T3tris ecosystem API — authoritative list of vaults with curation flags
const VAULTS_API = "https://ecosystem.t3tris.finance/vaults";

// Supported chains: DefiLlama chain name -> ecosystem-API chainId. T3tris is
// live on Arbitrum only for now (same CREATE3 addresses on every EVM chain);
// add a chain here once it goes live and the API returns verified vaults for it.
const CHAINS = { arbitrum: 42161 };

const ABI = {
  getGrossTVL:
    "function getGrossTVL() external view returns (uint256 totalManagedAssets, uint256 pendingDeposits, uint256 claimableRedeems, uint256 grossTVL)",
};

// Verified, non-blacklisted vaults for the given chainId, from the ecosystem API.
async function getVerifiedVaults(chainId) {
  const all = await getConfig("t3tris-finance/vaults", VAULTS_API);
  return (all || []).filter(
    (v) => v.verified && !v.blacklisted && Number(v.chainId) === chainId,
  );
}

async function tvl(api) {
  const vaults = await getVerifiedVaults(CHAINS[api.chain]);
  if (!vaults.length) return api.getBalances();

  // Read each vault's gross TVL breakdown on-chain
  const grossTvls = await api.multiCall({
    abi: ABI.getGrossTVL,
    calls: vaults.map((v) => v.address),
    permitFailure: true,
  });

  // Add each TVL component separately per underlying token. DefiLlama sums all
  // api.add() calls per token into one TVL figure, but breaking them out keeps
  // the adapter logic transparent.
  for (let i = 0; i < vaults.length; i++) {
    const g = grossTvls[i];
    if (!g) continue;
    const token = vaults[i].asset;
    const totalManagedAssets = g.totalManagedAssets || g[0];
    const pendingDeposits = g.pendingDeposits || g[1];
    const claimableRedeems = g.claimableRedeems || g[2];

    if (totalManagedAssets) api.add(token, totalManagedAssets);
    if (pendingDeposits) api.add(token, pendingDeposits);
    if (claimableRedeems) api.add(token, claimableRedeems);
  }

  return api.getBalances();
}

module.exports = {
  methodology:
    "Vaults are sourced from the T3tris ecosystem API; only verified, non-blacklisted vaults are counted. TVL = totalManagedAssets (assets deployed in strategies, per oracle NAV) + pendingDeposits (async deposit requests in yield-bearing depositSilo) + claimableRedeems (settled redemptions in yield-bearing redeemSilo), read on-chain per vault via getGrossTVL() and summed per underlying token.",
};

Object.keys(CHAINS).forEach((chain) => {
  module.exports[chain] = { tvl };
});
