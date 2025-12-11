// Yield Adapter for schUSD (Chateau's yield-bearing vault)
// This file should be placed in: src/adaptors/chateau/index.js
// in the yield-server repository

const sdk = require('@defillama/sdk');
const utils = require('../utils');

const CHUSD = '0x22222215d4Edc5510d23D0886133E7eCE7f5fdC1';
const SCHUSD = '0x888888bAb58a7Bd3068110749bC7b63B62Ce874d';
const CHAIN = 'plasma';

const abi = {
  totalAssets: 'uint256:totalAssets',
  totalSupply: 'uint256:totalSupply',
  previewRedeem: 'function previewRedeem(uint256 shares) view returns (uint256)',
};

const WAD = 10n ** 18n;

// Calculate APY from share price change over time
// For ERC-4626 vaults, APY = (currentSharePrice / previousSharePrice - 1) * (365 / daysDiff) * 100
async function getSharePrice(block) {
  const [totalSupply, totalAssets] = await Promise.all([
    sdk.api.abi.call({
      target: SCHUSD,
      abi: abi.totalSupply,
      chain: CHAIN,
      block,
    }),
    sdk.api.abi.call({
      target: SCHUSD,
      abi: abi.totalAssets,
      chain: CHAIN,
      block,
    }),
  ]);

  const supply = BigInt(totalSupply.output);
  const assets = BigInt(totalAssets.output);

  if (supply === 0n) return 1;
  return Number((assets * WAD) / supply) / 1e18;
}

async function apy() {
  // Get current data
  const [totalSupply, totalAssets] = await Promise.all([
    sdk.api.abi.call({
      target: SCHUSD,
      abi: abi.totalSupply,
      chain: CHAIN,
    }),
    sdk.api.abi.call({
      target: SCHUSD,
      abi: abi.totalAssets,
      chain: CHAIN,
    }),
  ]);

  const supply = BigInt(totalSupply.output);
  const assets = BigInt(totalAssets.output);
  const tvlUsd = Number(assets) / 1e18; // chUSD is pegged to USD

  // Calculate current share price
  const currentSharePrice = supply === 0n ? 1 : Number((assets * WAD) / supply) / 1e18;

  // For APY calculation, we need historical share price
  // Using 7-day lookback for more stable APY calculation
  // Note: You may need to adjust this based on available block history
  const SECONDS_PER_DAY = 86400;
  const DAYS_LOOKBACK = 7;

  let apyBase = 0;

  try {
    // Get block from 7 days ago (approximate)
    const currentBlock = await sdk.api.util.getLatestBlock(CHAIN);
    const blocksPerDay = 43200; // Approximate for Plasma (~2s block time)
    const historicalBlock = currentBlock.number - (blocksPerDay * DAYS_LOOKBACK);

    const previousSharePrice = await getSharePrice(historicalBlock);

    if (previousSharePrice > 0 && currentSharePrice > previousSharePrice) {
      // APY = (current/previous - 1) * (365/days) * 100
      const priceChange = currentSharePrice / previousSharePrice - 1;
      apyBase = priceChange * (365 / DAYS_LOOKBACK) * 100;
    }
  } catch (e) {
    // If historical data unavailable, APY will be 0
    console.log('Could not calculate historical APY:', e.message);
  }

  const pool = {
    pool: `${SCHUSD}-${CHAIN}`.toLowerCase(),
    chain: utils.formatChain(CHAIN),
    project: 'chateau',
    symbol: 'schUSD',
    tvlUsd,
    apyBase, // APY from vault yield
    underlyingTokens: [CHUSD], // schUSD is backed by chUSD
    poolMeta: 'ERC-4626 Vault',
    url: 'https://app.chateau.capital',
  };

  return [pool];
}

module.exports = {
  timetravel: false,
  apy,
  url: 'https://app.chateau.capital',
};
