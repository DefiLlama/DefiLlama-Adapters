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
 *   4. ARC-200 token markets (WAD, UNIT on Voi) are hardcoded and valued via
 *      api.addUSDValue() using DorkFi's on-chain price oracle.
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

// ARC-200 market IDs on Voi: underlying tokens are not visible in account.assets.
// These markets use DorkFi API's pre-computed USD value via api.addUSDValue().
// Market IDs (app IDs) that hold ARC-200 tokens as underlying:
//   420069   = UNIT (ARC-200 governance token)
//   47138068 = WAD  (ARC-200 stablecoin)
const ARC200_MARKET_IDS = new Set([420069, 47138068]);

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
 * Returns { kind: "native" | "asa" | "arc200", nativeNet?, asaId?, asaAmount? }
 *
 * - "native" : market holds meaningful native ALGO/VOI (real deposit balance)
 * - "asa"    : market holds a non-nToken ASA with a real (non-sentinel) balance
 * - "arc200" : underlying is ARC-200 or unknown — use USD value fallback
 *
 * Native detection uses a high threshold (5e9 microunits ≈ 5,000 ALGO/VOI)
 * to distinguish real native deposits from mere operational min-balances.
 * ARC-200 markets are explicitly listed in ARC200_MARKET_IDS.
 */
function identifyUnderlying(market, account) {
  // ARC-200 markets are hardcoded — skip account inspection entirely
  if (ARC200_MARKET_IDS.has(Number(market.marketId))) {
    return { kind: "arc200" };
  }

  const nTokenId   = Number(market.ntokenId);
  const minBalance = account["min-balance"] || 0;
  const nativeNet  = Math.max(0, account.amount - minBalance);

  // uint64 sentinel: near-max values indicate placeholder/nToken ASAs, not real balances
  const UINT64_MAX  = BigInt("18446744073709551615");
  const SENTINEL_LO = UINT64_MAX - BigInt(1_000_000);

  const nonNToken = (account.assets || []).filter(
    (a) => a["asset-id"] !== nTokenId && a.amount > 0
  );
  const realAssets = nonNToken.filter(
    (a) => BigInt(a.amount) < SENTINEL_LO
  );

  // Native market: nativeNet > 5,000 native coins (5e9 microunits) with no real ASAs.
  // Threshold chosen to exceed all known operational min-balances (~121–1,760 VOI/ALGO)
  // while being below real deposit balances (50K+ ALGO, 206M+ VOI).
  if (nativeNet > 5_000_000_000 && realAssets.length === 0) {
    return { kind: "native", nativeNet };
  }

  // ASA market
  if (realAssets.length > 0) {
    realAssets.sort((a, b) => Number(BigInt(b.amount) - BigInt(a.amount)));
    const top = realAssets[0];
    return { kind: "asa", asaId: top["asset-id"], asaAmount: top.amount };
  }

  // ARC-200 / unknown
  return { kind: "arc200" };
}

// ── Dedup (same market may appear under multiple pools) ───────────────────────

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
            // ARC-200 fallback — use DorkFi API's pre-computed USD value
            const usd = tvlMap[`${market.appId}:${market.marketId}`] || 0;
            if (usd > 0) api.addUSDValue(usd);
          }
        } catch (e) {
          // Skip transient network errors; re-throw logic errors so CI catches regressions.
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

    // Borrow USD for ARC-200 markets: baseUnits × price / 1e30 = USD value
    function borrowUsdFromPrice(borrowAmt, priceStr) {
      const priceRaw = BigInt(priceStr || "0");
      if (priceRaw === 0n || borrowAmt === 0n) return 0;
      return Number(borrowAmt) * Number(priceRaw) / 1e30;
    }

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
            // ARC-200 fallback — compute borrow USD from API price oracle
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
    "Voi Network. Native coins (ALGO/VOI) and ASAs are read from market contract " +
    "accounts. ARC-200 token markets (WAD, UNIT on Voi) use DorkFi's on-chain " +
    "price oracle via the DorkFi API. Borrowed reflects outstanding loans computed " +
    "from totalScaledBorrows × borrowIndex / 1e18.",
  algorand: {
    tvl:      makeTvl("algorand"),
    borrowed: makeBorrowed("algorand"),
  },
  voi: {
    tvl:      makeTvl("voi"),
    borrowed: makeBorrowed("voi"),
  },
};
