/**
 * DorkFi — DefiLlama TVL + Borrowed Adapter
 *
 * Chains: Algorand + Voi Network
 * Pools:
 *   Algorand: 3333688282 (Pool A), 3345940978 (Pool B)
 *   Voi:      47139778   (Pool A), 47139781   (Pool B)
 *
 * Architecture:
 *   1. Fetch live market data from DorkFi API (/market-data/{network})
 *   2. For each market, look up the market app's on-chain account to identify
 *      the underlying token (native coin or ASA balance, excluding the nToken).
 *   3. Report raw token amounts via api.add() so DeFi Llama can price them.
 *   4. Markets whose underlying tokens are not priced by DeFi Llama fall back
 *      to api.addUSDValue() using DorkFi's on-chain price oracle via the API.
 *      This covers ARC-200 tokens on Voi (WAD, UNIT) and several Algorand ASAs
 *      (UNIT, POW, FINITE, FOLKS, HAY, WAD) that lack DeFi Llama price feeds.
 *
 * Borrows use the same logic with totalScaledBorrows × borrowIndex / 1e18.
 */

const axios = require("axios");
const { getApplicationAddress } = require("../helper/chain/algorandUtils/address");

const SCALE    = BigInt("1000000000000000000"); // 1e18
const API_BASE = "https://dorkfi-api.nautilus.sh";
const NETWORK  = { algorand: "algorand-mainnet", voi: "voi-mainnet" };

const INDEXER_URL = {
  algorand: "https://mainnet-idx.algonode.cloud",
  voi:      "https://mainnet-idx.voi.nodely.dev",
};

// Markets whose underlying tokens are not priced by DeFi Llama's price oracle.
// These fall back to api.addUSDValue() using DorkFi's on-chain price oracle.
//
// Voi ARC-200 tokens (balances not visible in account.assets):
//   420069   = UNIT (ARC-200)
//   47138068 = WAD  (ARC-200)
//
// Algorand ASAs with no DeFi Llama price feed (verified via coins.llama.fi):
//   3220125024 = UNIT  (ASA 3121954282)
//   3080081069 = POW   (ASA 2994233666)
//   3211805086 = FINITE Pool A (ASA 400593267)
//   3211740909 = FINITE Pool B (ASA 400593267)
//   3346185062 = FOLKS Pool A  (ASA 3203964481)
//   3212771255 = FOLKS Pool B  (ASA 3203964481)
//   3212773584 = HAY           (ASA 3160000000)
//   3211890928 = HAY           (ASA 3160000000)
//   3333688448 = WAD on Algorand (ASA 3334160924)
const USE_API_PRICE = new Set([
  // Voi ARC-200
  420069, 47138068,
  // Algorand — no DeFi Llama price feed
  3220125024, 3080081069,
  3211805086, 3211740909,
  3346185062, 3212771255,
  3212773584, 3211890928,
  3333688448,
]);

// ── API helpers ───────────────────────────────────────────────────────────────

async function fetchMarketData(chain) {
  const { data } = await axios.get(`${API_BASE}/market-data/${NETWORK[chain]}`, { timeout: 30000 });
  if (!data.success) throw new Error(`DorkFi API error: market-data/${chain}`);
  return data.data;
}

async function fetchAnalyticsTVL(chain) {
  const { data } = await axios.get(`${API_BASE}/analytics/tvl/${NETWORK[chain]}`, { timeout: 30000 });
  if (!data.success) throw new Error(`DorkFi API error: analytics/tvl/${chain}`);
  const map = {};
  for (const m of data.data.markets || []) {
    map[`${m.appId}:${m.marketId}`] = m.tvl;
  }
  return map;
}

async function lookupAccount(chain, address) {
  const { data } = await axios.get(
    `${INDEXER_URL[chain]}/v2/accounts/${address}`,
    { timeout: 45000 }
  );
  return data.account;
}

// ── Token identification ──────────────────────────────────────────────────────

/**
 * Returns { kind: "native" | "asa" | "api_price", nativeNet?, asaId?, asaAmount? }
 *
 * - "native"    : market holds meaningful native ALGO/VOI (real deposit balance)
 * - "asa"       : market holds a non-nToken ASA priced by DeFi Llama
 * - "api_price" : token has no DeFi Llama price — use DorkFi API USD value
 *
 * Native detection uses a 5e9 microunit threshold to distinguish real deposit
 * balances (50K+ ALGO, 206M+ VOI) from operational min-balances (~121–1,760).
 */
function identifyUnderlying(market, account) {
  if (USE_API_PRICE.has(Number(market.marketId))) {
    return { kind: "api_price" };
  }

  const nTokenId   = Number(market.ntokenId);
  const minBalance = account["min-balance"] || 0;
  const nativeNet  = Math.max(0, account.amount - minBalance);

  const UINT64_MAX  = BigInt("18446744073709551615");
  const SENTINEL_LO = UINT64_MAX - BigInt(1_000_000);

  const nonNToken  = (account.assets || []).filter(
    (a) => a["asset-id"] !== nTokenId && a.amount > 0
  );
  const realAssets = nonNToken.filter((a) => BigInt(a.amount) < SENTINEL_LO);

  if (nativeNet > 5_000_000_000 && realAssets.length === 0) {
    return { kind: "native", nativeNet };
  }

  if (realAssets.length > 0) {
    realAssets.sort((a, b) => Number(BigInt(b.amount) - BigInt(a.amount)));
    const top = realAssets[0];
    return { kind: "asa", asaId: top["asset-id"], asaAmount: top.amount };
  }

  return { kind: "api_price" };
}

// ── Dedup ─────────────────────────────────────────────────────────────────────

function dedup(markets) {
  const seen = new Map();
  for (const m of markets) {
    const key = `${m.appId}:${m.marketId}`;
    if (!seen.has(key) || m.lastUpdated > seen.get(key).lastUpdated) {
      seen.set(key, m);
    }
  }
  return [...seen.values()];
}

// ── Amount helpers ────────────────────────────────────────────────────────────

function actualAmount(scaled, index) {
  return BigInt(scaled) * BigInt(index) / SCALE;
}

function borrowUsdFromPrice(borrowAmt, priceStr) {
  const priceRaw = BigInt(priceStr || "0");
  if (priceRaw === 0n || borrowAmt === 0n) return 0;
  return Number(borrowAmt) * Number(priceRaw) / 1e30;
}

// ── TVL factory ───────────────────────────────────────────────────────────────

function makeTvl(chain) {
  return async function tvl(api) {
    const [markets, tvlMap] = await Promise.all([
      fetchMarketData(chain),
      fetchAnalyticsTVL(chain),
    ]);

    await Promise.all(
      dedup(markets).map(async (market) => {
        try {
          const addr    = getApplicationAddress(market.marketId);
          const account = await lookupAccount(chain, addr);
          const token   = identifyUnderlying(market, account);

          if (token.kind === "native") {
            api.add("1", token.nativeNet);
          } else if (token.kind === "asa") {
            api.add(String(token.asaId), token.asaAmount);
          } else {
            const usd = tvlMap[`${market.appId}:${market.marketId}`] || 0;
            if (usd > 0) api.addUSDValue(usd);
          }
        } catch (e) {
          const status = e?.response?.status;
          if (!status || status >= 500 || status === 404 || status === 429) {
            console.error(`dorkfi: skipping market ${market.appId}:${market.marketId} — ${e.message}`);
          } else {
            throw e;
          }
        }
      })
    );
  };
}

// ── Borrowed factory ──────────────────────────────────────────────────────────

function makeBorrowed(chain) {
  return async function borrowed(api) {
    const markets = await fetchMarketData(chain);

    await Promise.all(
      dedup(markets).map(async (market) => {
        const borrowAmt = actualAmount(market.totalScaledBorrows, market.borrowIndex);
        if (borrowAmt === 0n) return;

        try {
          const addr    = getApplicationAddress(market.marketId);
          const account = await lookupAccount(chain, addr);
          const token   = identifyUnderlying(market, account);

          if (token.kind === "native") {
            api.add("1", borrowAmt.toString());
          } else if (token.kind === "asa") {
            api.add(String(token.asaId), borrowAmt.toString());
          } else {
            const usd = borrowUsdFromPrice(borrowAmt, market.price);
            if (usd > 0) api.addUSDValue(usd);
          }
        } catch (e) {
          const status = e?.response?.status;
          if (!status || status >= 500 || status === 404 || status === 429) {
            console.error(`dorkfi: skipping borrow for market ${market.appId}:${market.marketId} — ${e.message}`);
          } else {
            throw e;
          }
        }
      })
    );
  };
}

// ── Exports ───────────────────────────────────────────────────────────────────

module.exports = {
  timetravel: false,
  methodology:
    "TVL counts all assets deposited into DorkFi lending pools on Algorand and " +
    "Voi Network. Standard ASAs and native coins (ALGO/VOI) are priced via DeFi " +
    "Llama feeds. Tokens without DeFi Llama coverage (UNIT, WAD, POW, FINITE, " +
    "FOLKS, HAY on Algorand; WAD and UNIT ARC-200s on Voi) use DorkFi's on-chain " +
    "price oracle. Borrowed reflects totalScaledBorrows × borrowIndex / 1e18.",
  algorand: {
    tvl:      makeTvl("algorand"),
    borrowed: makeBorrowed("algorand"),
  },
  voi: {
    tvl:      makeTvl("voi"),
    borrowed: makeBorrowed("voi"),
  },
};
