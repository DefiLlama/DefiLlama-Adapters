// SSS DeFi TVL adapter draft for DefiLlama-Adapters.
//
// Target path in a DefiLlama-Adapters fork:
//   projects/sss-defi/index.js
//
// Data source:
//   https://dlhkk-raaaa-aaaak-qyl5a-cai.raw.icp0.io/api/external/v1/live/tvl_inputs.json
//
// This adapter intentionally uses live raw reserves exported by the SSS core
// canister and leaves USD pricing to DefiLlama's canonical token pricing layer.

const TVL_INPUTS_URL = "https://dlhkk-raaaa-aaaak-qyl5a-cai.raw.icp0.io/api/external/v1/live/tvl_inputs.json";
const CORE_CANISTER_ID = "dlhkk-raaaa-aaaak-qyl5a-cai";
const EXPECTED_POOL_IDS = new Set([9, 10, 11, 12, 13, 14]);
const EXPECTED_SYMBOLS = new Set(["ICP", "ETH", "USDC", "USDT"]);

const COINGECKO_BY_SYMBOL = {
  ICP: "internet-computer",
  ETH: "ethereum",
  USDC: "usd-coin",
  USDT: "tether",
};

const METHODOLOGY = `TVL includes only enabled public non-legacy SSS canonical pool reserves on the Internet Computer. Canonical assets are ICP, ETH, USDC, and USDT. User balances, pending deposits, pending withdrawals, route reserves, treasury reserves, protocol fee vaults, referral liabilities, hidden pools, disabled pools, legacy pools, and settlement-route assets are excluded.`;

function decodeNat(value) {
  if (typeof value === "number") return BigInt(value);
  if (typeof value === "string") return BigInt(value);
  if (typeof value === "bigint") return value;
  if (Array.isArray(value)) {
    // Candid Nat / num-bigint may be serialized as little-endian base-2^32 limbs.
    return value.reduce((acc, limb, idx) => acc + (BigInt(limb) << BigInt(32 * idx)), 0n);
  }
  throw new Error(`Unsupported integer value: ${JSON.stringify(value)}`);
}

function atomicToDecimalString(rawAtomic, decimals) {
  // DefiLlama CG-token helpers may expect decimal amounts depending on the SDK
  // version. Keep this conversion isolated so it is easy to adapt during PR
  // review if the target helper expects raw atomic amounts instead.
  const base = 10n ** BigInt(decimals);
  const whole = rawAtomic / base;
  const frac = rawAtomic % base;
  if (frac === 0n) return whole.toString();
  return `${whole}.${frac.toString().padStart(decimals, "0").replace(/0+$/, "")}`;
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
  return res.json();
}

function addCanonicalBalance(api, symbol, rawAtomic, decimals) {
  const coingeckoId = COINGECKO_BY_SYMBOL[symbol];
  if (!coingeckoId) throw new Error(`Missing CoinGecko id for ${symbol}`);
  const amount = Number(atomicToDecimalString(rawAtomic, decimals));
  if (!Number.isFinite(amount)) {
    throw new Error(`Invalid normalized amount for ${symbol}: ${amount}`);
  }
  if (Math.abs(amount) > Number.MAX_SAFE_INTEGER) {
    throw new Error(`Normalized amount for ${symbol} exceeds Number.MAX_SAFE_INTEGER: ${amount}`);
  }

  // DefiLlama SDK versions differ across adapters. The common review path is:
  // 1) prefer api.addCGToken when available;
  // 2) otherwise store in api.add with a synthetic key agreed during PR review.
  if (typeof api.addCGToken === "function") {
    api.addCGToken(coingeckoId, amount);
    return;
  }
  if (typeof api.add === "function") {
    api.add(`coingecko:${coingeckoId}`, amount);
    return;
  }
  throw new Error("No supported balance add helper found on DefiLlama api object");
}

async function tvl(api) {
  const data = await fetchJson(TVL_INPUTS_URL);
  if (String(data.core_canister_id) !== CORE_CANISTER_ID) {
    throw new Error(`Unexpected core canister id: ${data.core_canister_id}`);
  }

  for (const token of data.tokens || []) {
    const symbol = String(token.symbol || "").toUpperCase();
    if (!EXPECTED_SYMBOLS.has(symbol)) {
      throw new Error(`Unexpected exported token: ${symbol}`);
    }
  }

  const seen = new Set();
  for (const pool of data.pools || []) {
    const poolId = Number(decodeNat(pool.pool_id));
    seen.add(poolId);
    if (!EXPECTED_POOL_IDS.has(poolId)) continue;
    if (pool.enabled !== true || pool.public_visible !== true || pool.legacy !== false) continue;

    for (const side of ["0", "1"]) {
      const symbol = String(pool[`token${side}_symbol`] || "").toUpperCase();
      if (!EXPECTED_SYMBOLS.has(symbol)) {
        throw new Error(`Unexpected token in pool ${poolId}: ${symbol}`);
      }
      const decimals = Number(decodeNat(pool[`token${side}_decimals`]));
      const rawAtomic = decodeNat(pool[`reserve${side}_atomic`]);
      addCanonicalBalance(api, symbol, rawAtomic, decimals);
    }
  }

  for (const expected of EXPECTED_POOL_IDS) {
    if (!seen.has(expected)) throw new Error(`Missing expected SSS pool id: ${expected}`);
  }
}

module.exports = {
  timetravel: false,
  methodology: METHODOLOGY,
  icp: {
    tvl,
  },
};
