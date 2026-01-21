/**
 * PagCrypto – Volume & Fees Adapter (On-chain proxy)
 *
 * This adapter DOES NOT track TVL.
 * It tracks an on-chain proxy for Total Transaction Volume (TTV),
 * defined as the sum of transfers received by PagCrypto wallets.
 */

const { getLogs } = require("../helper/cache/getLogs");
const { getPrices } = require("../helper/prices");

const config = require("./config");

// ERC20 Transfer event signature
const TRANSFER_TOPIC =
    "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

// Tokens considered for volume calculation (EVM only)
const EVM_TOKENS = {
  ethereum: [
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
    "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
  ],
  polygon: [
    "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // USDC
  ],
  base: [
    "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC Base
  ],
};

function getDayBounds(timestamp) {
  const start = Math.floor(timestamp / 86400) * 86400;
  return { from: start, to: start + 86400 - 1 };
}

async function evmDailyVolume(chain, api, timestamp) {
  const chainCfg = config.chains[chain];
  if (!chainCfg || chainCfg.status === "soon") {
    return { dailyVolume: "0" };
  }

  const wallet = chainCfg.wallet.toLowerCase();
  const tokens = EVM_TOKENS[chain] || [];
  if (!tokens.length) return { dailyVolume: "0" };

  const { from, to } = getDayBounds(timestamp);

  let totalUsd = 0;

  for (const token of tokens) {
    const toTopic = "0x" + wallet.replace("0x", "").padStart(64, "0");

    const logs = await getLogs({
      api,
      target: token,
      topics: [TRANSFER_TOPIC, null, toTopic],
      fromBlock: await api.getBlockNumber(from),
      toBlock: await api.getBlockNumber(to),
      chain,
    });

    if (!logs.length) continue;

    const rawSum = logs.reduce(
        (acc, log) => acc + BigInt(log.data),
        0n
    );

    if (rawSum === 0n) continue;

    const decimals = await api.call({
      abi: "erc20:decimals",
      target: token,
      chain,
    });

    const amount = Number(rawSum) / 10 ** Number(decimals);

    const priceKey = `${chain}:${token}`.toLowerCase();
    const prices = await getPrices([priceKey]);
    const price = prices?.[priceKey]?.price || 0;

    totalUsd += amount * price;
  }

  return { dailyVolume: totalUsd.toFixed(2) };
}

function feesFromVolume(volumeUsd) {
  // Conservative placeholder fees (can be refined later)
  const feeRate = 0.008;     // 0.8%
  const revenueRate = 0.004; // 0.4%
  return {
    dailyFees: (volumeUsd * feeRate).toFixed(2),
    dailyRevenue: (volumeUsd * revenueRate).toFixed(2),
  };
}

function makeVolumeFetcher(chain) {
  return async (timestamp, api) => evmDailyVolume(chain, api, timestamp);
}

function makeFeesFetcher(chain) {
  return async (timestamp, api) => {
    const vol = await evmDailyVolume(chain, api, timestamp);
    const v = Number(vol.dailyVolume || 0);
    return feesFromVolume(v);
  };
}

module.exports = {
  ethereum: {
    fetch: makeVolumeFetcher("ethereum"),
    fees: makeFeesFetcher("ethereum"),
    start: async () => 0,
  },

  polygon: {
    fetch: makeVolumeFetcher("polygon"),
    fees: makeFeesFetcher("polygon"),
    start: async () => 0,
  },

  base: {
    fetch: makeVolumeFetcher("base"),
    fees: makeFeesFetcher("base"),
    start: async () => 0,
  },

  // Not yet computed on-chain (return zero for now)
  solana: { fetch: async () => ({ dailyVolume: "0" }), start: async () => 0 },
  xrpl:   { fetch: async () => ({ dailyVolume: "0" }), start: async () => 0 },
  tron:   { fetch: async () => ({ dailyVolume: "0" }), start: async () => 0 },
  toncoin:{ fetch: async () => ({ dailyVolume: "0" }), start: async () => 0 },

  arbitrum:{ fetch: async () => ({ dailyVolume: "0" }), start: async () => 0 },
  optimism:{ fetch: async () => ({ dailyVolume: "0" }), start: async () => 0 },
};
