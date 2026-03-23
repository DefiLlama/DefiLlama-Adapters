/**
 * DeFiLlama TVL Adapter for Rocket
 *
 * Rocket is a high-performance L1 blockchain for trading derivatives.
 * The Rocket Liquidity Provider (RLP) vault accepts collateral deposits
 * that serve as counterparty liquidity for perpetual futures trading.
 *
 * TVL = vault collateral (via Rocket API) + bridge deposits (on Arbitrum)
 *
 * API Docs: https://rocketfoundation.gitbook.io/rocket-docs/rocket/api
 * API Base: https://beta.rocket-cluster-1.com
 * Endpoints used:
 *   GET /vaults         - list of vault addresses
 *   GET /collateral     - collateral balances per vault account
 *
 * Bridge: Arbitrum contract 0xde26aeE51885AD5239f9F7C207214f5Bf547c8f2
 * Audit: Omniscia (December 2025) - Bridge security audit, all issues resolved
 * Website: https://rocketfi.io
 * GitHub: https://github.com/rocketfoundation
 */

const { sumTokens2 } = require("../helper/unwrapLPs");
const ADDRESSES = require("../helper/coreAssets.json");
const { fetchURL } = require("../helper/utils");

const ROCKET_API = "https://beta.rocket-cluster-1.com";
const VAULT_ADDRESS = "0x6BC2179a284CB2A2857C379391E0158524de7cA0";
const BRIDGE_ADDRESS = "0xde26aeE51885AD5239f9F7C207214f5Bf547c8f2";

/**
 * Fetch vault collateral from the Rocket Chain API.
 * Returns total USD value of USDC collateral in RLP vaults.
 * Uses fetchURL (axios-based) which automatically throws on non-2xx responses.
 */
async function fetchRocketVaultTvl() {
          let totalTvl = 0;

  // Discover all vaults
  let vaultAccounts = [];
          try {
                      const { data: vaultsData } = await fetchURL(`${ROCKET_API}/vaults`);

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

  // Sum collateral across all vaults
  for (const account of vaultAccounts) {
              try {
                            const { data: colData } = await fetchURL(
                                            `${ROCKET_API}/collateral?account=${encodeURIComponent(account)}`
                                          );
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

  return totalTvl;
}

/**
 * Arbitrum TVL: bridge contract token balances + Rocket vault collateral.
 * Vault collateral is denominated in USDC and added under the usd-coin key.
 */
async function arbitrumTvl(api) {
          // On-chain bridge balances
  const balances = await sumTokens2({
              api,
              owners: [BRIDGE_ADDRESS],
              tokens: [
                            ADDRESSES.arbitrum.USDC,
                            ADDRESSES.arbitrum.USDC_CIRCLE,
                            ADDRESSES.arbitrum.USDT,
                            ADDRESSES.arbitrum.WETH,
                          ],
  });

  // Add Rocket Chain vault collateral (USDC-denominated)
  const vaultTvl = await fetchRocketVaultTvl();
          if (vaultTvl > 0) {
                      const usdcKey = "usd-coin";
                      balances[usdcKey] = (balances[usdcKey] || 0) + vaultTvl;
          }

  return balances;
}

module.exports = {
          timetravel: false,
          misrepresentedTokens: false,
          methodology:
                      "TVL is calculated by summing (1) all USDC collateral deposited in " +
                      "Rocket Liquidity Provider vaults via the Rocket Chain API, and " +
                      "(2) tokens held in the Rocket Bridge contract on Arbitrum.",
          arbitrum: {
                      tvl: arbitrumTvl,
          },
};
