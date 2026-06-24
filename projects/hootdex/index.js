/**
 * HootDEX / Pecu Novus — DeFiLlama TVL Adapter
 *
 */

const CHAIN_PROVIDERS = require("@defillama/sdk/build/providers.json");
const RPC_URL = CHAIN_PROVIDERS["pecu"]?.rpc?.[0];

const CHAIN   = "pecu";
const USD_PEG = "tether";

if (!RPC_URL) throw new Error("pecu RPC not found in @defillama/sdk providers.json");

async function rpcPost(method, params = []) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30_000);
  try {
    const res = await fetch(RPC_URL, {
      method:  "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body:    JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
      signal:  controller.signal,
    });
    if (!res.ok) throw new Error(`RPC HTTP ${res.status} on method ${method}`);
    const json = await res.json();
    if (json.error) throw new Error(`RPC error [${json.error.code}]: ${json.error.message}`);
    return json.result;
  } finally {
    clearTimeout(timer);
  }
}

async function tvl(api) {
  const result = await rpcPost("hootdex_getTokens");

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
