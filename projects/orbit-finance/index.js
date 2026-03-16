const { sumTokens2 } = require("../helper/solana");

const ADAPTER_BASE = "https://orbit-dex.api.cipherlabsx.com";

async function tvl() {
  const res = await fetch(`${ADAPTER_BASE}/api/v1/pools`);
  const data = await res.json();
  const pools = Array.isArray(data?.pools) ? data.pools : [];

  const tokenAccounts = [];
  for (const pool of pools) {
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
