// DefiLlama TVL adapter for Hootdex (Pecu Novus Blockchain).
const HOOTDEX_API = (process.env.HOOTDEX_API || "https://api.pecunovus.net")
  .replace(/\/+$/, ""); // strip trailing slash so URL doesn't end up with "//"
const ROUTE_PREFIX = "/api/v3/chain";
const CHAIN = "pecu"; // Pecu Novus mainnet, Chain ID 27272727
const USD_PEG_CGID = "tether";
const FETCH_TIMEOUT_MS = 30_000;

async function getJson(path) {
  const url = `${HOOTDEX_API}${ROUTE_PREFIX}${path}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { accept: "application/json" },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Hootdex API ${res.status} for ${path}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function tvl(api) {
  const body = await getJson("/tvl");
  const value = Number(body?.tvl);
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(
      `Hootdex /api/v3/chain/tvl returned invalid value: ${JSON.stringify(body)}`
    );
  }
  // Reported as USD value locked, pegged via tether (~$1).
  api.addCGToken(USD_PEG_CGID, value);
  return api.getBalances();
}

module.exports = {
  methodology:
    "TVL is the sum of USD value locked across all Hootdex asset classes " +
    "(synthetics — including PECU — stablecoins, derivatives and forex pools), " +
    "as reported by the Hootdex /api/v3/chain/tvl endpoint. Balances settle off-chain " +
    "on Pecu Novus (Chain ID 27272727) and are reported in USD.",
  misrepresentedTokens: true,
  timetravel: false,
  [CHAIN]: { tvl },
};