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

// Config
const ROCKET_API = "https://beta.rocket-cluster-1.com";
const VAULT_ADDRESS = "0x6BC2179a284CB2A2857C379391E0158524de7cA0";
const BRIDGE_ADDRESS = "0xde26aeE51885AD5239f9F7C207214f5Bf547c8f2";

// Rocket Chain TVL: sum collateral in vaults via API
async function rocketChainTvl() {
      const { default: fetch } = await import("node-fetch");

  let totalTvl = 0;

  // Discover vaults
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

  // Fallback to hardcoded vault
  if (vaultAccounts.length === 0) {
          vaultAccounts = [VAULT_ADDRESS];
  }

  // Sum collateral across all vaults
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

  return { tether: totalTvl };
}

// Arbitrum TVL: read bridge contract token balances on-chain
async function arbitrumTvl(api) {
      return sumTokens2({
              api,
              owners: [BRIDGE_ADDRESS],
              tokens: [
                        ADDRESSES.arbitrum.USDC,
                        ADDRESSES.arbitrum.USDC_CIRCLE,
                        ADDRESSES.arbitrum.USDT,
                        ADDRESSES.arbitrum.WETH,
                      ],
      });
}

module.exports = {
      timetravel: false,
      misrepresentedTokens: false,
      methodology:
              "TVL is calculated by summing (1) all USDC collateral deposited in " +
              "Rocket LP vaults via the Rocket Chain API, and (2) tokens held in " +
              "the Rocket Bridge contract on Arbitrum.",
      fetch: rocketChainTvl,
      arbitrum: {
              tvl: arbitrumTvl,
      },
};
