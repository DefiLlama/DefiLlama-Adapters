/**
 * PagCrypto – Volume & Fees Adapter (On-chain proxy)
 *
 * No TVL.
 * No external fetch.
 * No price helper dependency.
 *
 * Volume definition (proxy):
 * - Sum of stablecoin transfers (USDC/USDT) received by PagCrypto wallet per day (USD=amount).
 * Fees:
 * - Fixed % over dailyVolume (placeholder; refine later).
 */

const fs = require("fs");
const path = require("path");

// Ensure DefiLlama SDK local cache dir exists (prevents ENOENT on CI runners)
try {
  const sdkEntry = require.resolve("@defillama/sdk");
  const sdkBuildDir = path.dirname(sdkEntry); // .../@defillama/sdk/build
  const localCacheDir = path.join(sdkBuildDir, "util", "local_cache");
  fs.mkdirSync(path.join(localCacheDir, "zlib-1.0"), { recursive: true });
} catch (e) {
  // ignore – cache is optional; we just try to avoid ENOENT
}

const { getLogs } = require("../helper/cache/getLogs");
const config = require("./config");

// ERC20 Transfer event signature
const TRANSFER_TOPIC =
    "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

// Only stablecoins → USD ~= token amount (no price lookup needed)
const STABLECOINS = {
  ethereum: {
    // mainnet
    tokens: [
      "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
      "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
    ],
  },
  polygon: {
    tokens: [
      "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // USDC
      // USDT Polygon (optional): 0xC2132D05D31c914a87C6611C10748AaCbC5325? (confira antes)
    ],
  },
  base: {
    tokens: [
      "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC Base
    ],
  },
  // enable later
  arbitrum: { tokens: [] },
  optimism: { tokens: [] },
};

function getDayBounds(timestamp) {
  const start = Math.floor(timestamp / 86400) * 86400;
  return { from: start, to: start + 86400 - 1 };
}

async function evmDailyStablecoinInflowUsd(chain, api, timestamp) {
  const chainCfg = config.chains?.[chain];
  if (!chainCfg || chainCfg.status === "soon") return { dailyVolume: "0" };

  const wallet = chainCfg.wallet.toLowerCase();
  const tokens = STABLECOINS[chain]?.tokens ?? [];
  if (!tokens.length) return { dailyVolume: "0" };

  const { from, to } = getDayBounds(timestamp);

  let totalUsd = 0;

  for (const token of tokens) {
    const toTopic = "0x" + wallet.replace("0x", "").padStart(64, "0");

    const fromBlock = await api.getBlockNumber(from);
    const toBlock = await api.getBlockNumber(to);

    const logs = await getLogs({
      api,
      target: token,
      topics: [TRANSFER_TOPIC, null, toTopic],
      fromBlock,
      toBlock,
      chain,
    });

    if (!logs.length) continue;

    const rawSum = logs.reduce((acc, log) => acc + BigInt(log.data), 0n);
    if (rawSum === 0n) continue;

    const decimals = await api.call({
      abi: "erc20:decimals",
      target: token,
      chain,
    });

    const amount = Number(rawSum) / 10 ** Number(decimals);

    // Stablecoins assumed ~$1
    totalUsd += amount;
  }

  return { dailyVolume: totalUsd.toFixed(2) };
}

function feesFromVolume(volumeUsd) {
  // placeholder (ajuste depois)
  const feeRate = 0.008;     // 0.8%
  const revenueRate = 0.004; // 0.4%
  return {
    dailyFees: (volumeUsd * feeRate).toFixed(2),
    dailyRevenue: (volumeUsd * revenueRate).toFixed(2),
  };
}

function makeVolumeFetcher(chain) {
  return async (timestamp, api) => evmDailyStablecoinInflowUsd(chain, api, timestamp);
}

function makeFeesFetcher(chain) {
  return async (timestamp, api) => {
    const vol = await evmDailyStablecoinInflowUsd(chain, api, timestamp);
    const v = Number(vol.dailyVolume || 0);
    return feesFromVolume(v);
  };
}

module.exports = {
  // EVM chains with on-chain stablecoin inflow proxy
  ethereum: { fetch: makeVolumeFetcher("ethereum"), fees: makeFeesFetcher("ethereum"), start: async () => 0 },
  polygon:  { fetch: makeVolumeFetcher("polygon"),  fees: makeFeesFetcher("polygon"),  start: async () => 0 },
  base:     { fetch: makeVolumeFetcher("base"),     fees: makeFeesFetcher("base"),     start: async () => 0 },

  // Not computed here (return zero for now)
  arbitrum: { fetch: async () => ({ dailyVolume: "0" }), fees: async () => ({ dailyFees: "0", dailyRevenue: "0" }), start: async () => 0 },
  optimism: { fetch: async () => ({ dailyVolume: "0" }), fees: async () => ({ dailyFees: "0", dailyRevenue: "0" }), start: async () => 0 },

  solana:   { fetch: async () => ({ dailyVolume: "0" }), start: async () => 0 },
  tron:     { fetch: async () => ({ dailyVolume: "0" }), start: async () => 0 },
};
