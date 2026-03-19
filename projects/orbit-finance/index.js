const { sumTokens2 } = require("../helper/solana");
const { getConfig } = require("../helper/cache");

const ADAPTER_BASE = "https://orbit-dex.api.cipherlabsx.com";

// CIPHER native token mint
const CIPHER_MINT = "Ciphern9cCXtms66s8Mm6wCFC27b2JProRQLYmiLMH3N";

/**
 * Computes TVL by summing token balances in all CipherDLMM pool vaults
 * (base + quote) on Solana. Vault addresses are fetched from the adapter
 * API (cached via getConfig) and verified on-chain via sumTokens2.
 * All tokens (including CIPHER) are counted here; staking tracks
 * CIPHER locked in Streamflow separately (different tokens, no double-count).
 */
async function tvl() {
  const data = await getConfig("orbit-finance", `${ADAPTER_BASE}/api/v1/pools`);
  if (!Array.isArray(data?.pools)) throw new Error("Unexpected API response: missing pools array");

  const tokenAccounts = new Set();
  for (const pool of data.pools) {
    if (typeof pool?.baseVault === "string" && pool.baseVault) tokenAccounts.add(pool.baseVault);
    if (typeof pool?.quoteVault === "string" && pool.quoteVault) tokenAccounts.add(pool.quoteVault);
  }
  if (data.pools.length > 0 && tokenAccounts.size === 0) {
    throw new Error("Unexpected API response: pools found but no valid vault addresses");
  }

  return sumTokens2({ tokenAccounts: [...tokenAccounts] });
}

/**
 * Staking TVL: total CIPHER locked in Streamflow staking streams.
 * Staked CIPHER is distributed across per-user escrow accounts so we
 * read the aggregate total from the adapter's Streamflow indexer.
 */
async function staking() {
  const data = await getConfig("orbit-finance-staking", `${ADAPTER_BASE}/api/v1/streamflow/vaults`);
  const cipherVault = (data.vaults ?? []).find((v) => v.tokenMint === CIPHER_MINT);
  if (!cipherVault?.total_staked_raw) return {};
  return { ["solana:" + CIPHER_MINT]: cipherVault.total_staked_raw };
}

module.exports = {
  timetravel: false,
  solana: { tvl, staking },
  methodology:
    "TVL is the sum of all token balances in CipherDLMM pool vaults (base + quote) on Solana. Staking TVL separately counts CIPHER locked in the Streamflow staking pool.",
};
