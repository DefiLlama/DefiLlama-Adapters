/**
 * HootDEX / Pecu Novus — DeFiLlama TVL Adapter
 *
 */

const { getProvider } = require("@defillama/sdk");

const CHAIN   = "pecu";
const USD_PEG = "tether";

async function tvl(api) {
  const provider = getProvider(CHAIN);

  const result = await provider.send("hootdex_getTokens", []);

  const tokens = result?.data ?? result?.tokens ?? [];
  if (!Array.isArray(tokens) || tokens.length === 0) {
    throw new Error(`hootdex_getTokens returned no token data: ${JSON.stringify(result)}`);
  }

  const totalTvl = tokens.reduce((sum, token) => {
    const v = Number(token?.tvl);
    return sum + (Number.isFinite(v) && v > 0 ? v : 0);
  }, 0);

  if (totalTvl <= 0) {
    throw new Error(`hootdex_getTokens: computed TVL is 0 — token tvl fields may be unpopulated`);
  }

  api.addCGToken(USD_PEG, totalTvl);
  return api.getBalances();
}

module.exports = {
  methodology:
    "TVL is the aggregate USD value locked across all HootDEX asset classes " +
    "(synthetics, crypto-derivative pairs, wrapped tokens, stablecoins, " +
    "project tokens, and holding tokens) as returned by the hootdex_getTokens " +
    "JSON-RPC 2.0 method via the DeFiLlama SDK provider for the pecu chain " +
    "(Chain ID 27272727). Balances are settled on the Pecu Novus ledger and " +
    "reported in USD.",
  misrepresentedTokens: true,
  timetravel: false,
  [CHAIN]: { tvl },
};
