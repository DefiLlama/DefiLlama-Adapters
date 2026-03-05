const { getConfig } = require("../helper/cache");

// Chain ID mapping for napier-api
const CHAIN_IDS = {
  ethereum: 1,
  base: 8453,
  arbitrum: 42161,
  optimism: 10,
  sonic: 146,
  mantle: 5000,
  bsc: 56,
  polygon: 137,
  avax: 43114,
  fraxtal: 252,
  hyperliquid: 999,
};

const NAPIER_API_BASE = "https://api-v2.napier.finance";

async function tvl(api) {
  const chain = api.chain;
  const chainId = CHAIN_IDS[chain];

  if (!chainId) {
    throw new Error(`No chain ID configured for: ${chain}`);
  }

  const markets = await getConfig(
    `napier/markets/${chain}`,
    `${NAPIER_API_BASE}/v1/market?chainIds=${chainId}`
  );

  if (!markets || !Array.isArray(markets) || markets.length === 0) {
    return {};
  }

  for (const market of markets) {
    if (!market.metrics || market.status?.isPaused) {
      continue;
    }

    const assetToken = market.tokens?.assetToken?.address;
    const totalTvlInAsset = market.metrics.totalTvlInAsset;

    if (assetToken && totalTvlInAsset && BigInt(totalTvlInAsset) > 0n) {
      api.add(assetToken, totalTvlInAsset);
    }
  }
}

module.exports = {
  methodology:
    "Total value of assets held in Napier smart contracts, including Curve AMM (TwoCrypto) pools, Napier AMM (TokiHook) pools, and PT/YT contracts.",
};

Object.keys(CHAIN_IDS).forEach((chain) => {
  module.exports[chain] = { tvl };
});
