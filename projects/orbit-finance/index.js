const { sumTokens2 } = require("../helper/solana");

const ADAPTER_BASE = "https://orbit-dex.api.cipherlabsx.com";

/**
 * Computes TVL by summing token balances in all CipherDLMM pool vaults
 * (base + quote) on Solana. Vault addresses are fetched from the adapter
 * API and verified on-chain via sumTokens2.
 */
async function tvl() {
  const res = await fetch(`${ADAPTER_BASE}/api/v1/pools`);
  if (!res.ok) throw new Error(`Orbit API error: ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data?.pools)) throw new Error("Unexpected API response: missing pools array");

  const tokenAccounts = [];
  for (const pool of data.pools) {
    if (pool.baseVault) tokenAccounts.push(pool.baseVault);
    if (pool.quoteVault) tokenAccounts.push(pool.quoteVault);
  }

  return sumTokens2({ tokenAccounts });
}

module.exports = {
  timetravel: false,
  solana: { tvl },
  methodology:
    "TVL is the sum of token balances in all CipherDLMM pool vaults (base + quote) on Solana.",
};
