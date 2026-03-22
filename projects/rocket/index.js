/**
 * DeFiLlama TVL Adapter for Rocket
 *
 * Rocket is a high-performance L1 blockchain for trading derivatives.
 * The Rocket Liquidity Provider (RLP) vault accepts collateral deposits
 * that serve as counterparty liquidity for perpetual futures trading.
 *
 * TVL = total collateral deposited across all RLP vaults.
 *
 * API Docs: https://rocketfoundation.gitbook.io/rocket-docs/rocket/api
 * API Base: https://beta.rocket-cluster-1.com
 * Endpoints used:
 *   GET /vaults         - list of vault addresses
 *   GET /collateral     - collateral balances per vault account
 *
 * Audit: Omniscia (December 2025) - Bridge security audit, all issues resolved
 * Website: https://rocketfi.io
 * GitHub: https://github.com/rocketfoundation
 */

// Config
const ROCKET_API = "https://beta.rocket-cluster-1.com";
const VAULT_ADDRESS = "0x6BC2179a284CB2A2857C379391E0158524de7cA0";

// TVL Function
async function tvl() {
    const { default: fetch } = await import("node-fetch");

  let totalTvl = 0;

  // Step 1: Discover all vaults
  let vaultAccounts = [];
    try {
          const vaultsRes = await fetch(`${ROCKET_API}/vaults`);
          const vaultsData = await vaultsRes.json();

      if (Array.isArray(vaultsData)) {
              vaultAccounts = vaultsData
                .map((v) => v.address || v.account || v.vaultAddress || v.id)
                .filter(Boolean);
      } else if (vaultsData && typeof vaultsData === "object") {
              const list = vaultsData.vaults || vaultsData.pools || [];
              if (Array.isArray(list)) {
                        vaultAccounts = list
                          .map((v) => v.address || v.account || v.vaultAddress || v.id)
                          .filter(Boolean);
              }
      }
    } catch (e) {
          console.error("Failed to fetch /vaults:", e.message);
    }

  // Fallback: use hardcoded vault address
  if (vaultAccounts.length === 0) {
        vaultAccounts = [VAULT_ADDRESS];
  }

  // Step 2: Sum collateral across all vaults
  for (const account of vaultAccounts) {
        try {
                const colRes = await fetch(
                          `${ROCKET_API}/collateral?account=${encodeURIComponent(account)}`
                        );
                const colData = await colRes.json();
                const collaterals = colData.collaterals || colData;

          if (typeof collaterals === "object" && !Array.isArray(collaterals)) {
                    for (const [, amount] of Object.entries(collaterals)) {
                                const val = parseFloat(amount);
                                if (!isNaN(val) && val > 0) {
                                              totalTvl += val;
                                }
                    }
          }
        } catch (e) {
                console.error(`Failed collateral for ${account}:`, e.message);
        }
  }

  // Collateral is denominated in USD (USDC)
  return { tether: totalTvl };
}

// Export
module.exports = {
    timetravel: false,
    misrepresentedTokens: false,
    methodology:
          "TVL is calculated by summing all collateral (USDC) deposited in " +
          "Rocket Liquidity Provider vaults via the Rocket Chain API.",
    fetch: tvl,
};
