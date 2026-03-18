const { sumTokens2 } = require("../helper/solana");
const { getConfig } = require("../helper/cache");

const ADAPTER_BASE = "https://orbit-dex.api.cipherlabsx.com";

// CIPHER native token mint
const CIPHER_MINT = "Ciphern9cCXtms66s8Mm6wCFC27b2JProRQLYmiLMH3N";
// Streamflow staking vault — SPL token account holding all staked CIPHER
const CIPHER_STAKING_VAULT = "Fh7u35PsxFWBWNE5Pme2yffixJ5H7YocAymJHs6L73N";

/**
 * Computes TVL by summing token balances in all CipherDLMM pool vaults
 * (base + quote) on Solana. Vault addresses are fetched from the adapter
 * API (cached via getConfig) and verified on-chain via sumTokens2.
 * The protocol's native CIPHER token is excluded from TVL and tracked
 * separately under staking.
 */
async function tvl() {
  const data = await getConfig("orbit-finance", `${ADAPTER_BASE}/api/v1/pools`);
  if (!Array.isArray(data?.pools)) throw new Error("Unexpected API response: missing pools array");

  const tokenAccounts = [];
  for (const pool of data.pools) {
    if (pool.baseVault) tokenAccounts.push(pool.baseVault);
    if (pool.quoteVault) tokenAccounts.push(pool.quoteVault);
  }

  return sumTokens2({ tokenAccounts, blacklistedTokens: [CIPHER_MINT] });
}

async function staking() {
  return sumTokens2({ tokenAccounts: [CIPHER_STAKING_VAULT] });
}

module.exports = {
  timetravel: false,
  solana: { tvl, staking },
  methodology:
    "TVL is the sum of non-CIPHER token balances in all CipherDLMM pool vaults (base + quote) on Solana. Staking TVL counts CIPHER locked in the Streamflow staking pool.",
};
