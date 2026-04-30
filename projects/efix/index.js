/**
 * efixDI+ Protocol — DefiLlama TVL Adapter v6
 *
 * TVL = totalSupply of efixDI on each chain, priced via Chainlink BRL/USD.
 * Each token is backed 1:1 by Brazilian DI fund shares.
 *
 * Cross-chain: LayerZero V2 OFT bridge (burn on source, mint on destination).
 * OFTAdapter on Polygon, MinterBurner on Base — OFT burn-and-mint semantics.
 * Counting both chains is the most accurate approach.
 *
 * Chainlink BRL/USD oracle: 0xB90DA3ff54C3ED09115abf6FbA0Ff4645586af2c (Polygon)
 * Since efixDI = 1 BRL, we convert supply to USD-equivalent USDC for pricing.
 */

const sdk = require("@defillama/sdk");

// --- Contract addresses ---
const efixDIPolygon = "0x04082b283818D9d0dd9Ee8742892eEe5CC396441";
const efixDIBase = "0xF5cA55f3ea5Bcd180aEa6dF9E05a0E63A66f5608";
const chainlinkBrlUsd = "0xB90DA3ff54C3ED09115abf6FbA0Ff4645586af2c";

// USDC addresses (used as USD-equivalent for pricing)
const USDC_POLYGON = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"; // USDC.e 6 decimals
const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";    // native USDC 6 decimals

// Chainlink latestRoundData ABI
const latestRoundDataAbi = {
  inputs: [],
  name: "latestRoundData",
  outputs: [
    { name: "roundId", type: "uint80" },
    { name: "answer", type: "int256" },
    { name: "startedAt", type: "uint256" },
    { name: "updatedAt", type: "uint256" },
    { name: "answeredInRound", type: "uint80" },
  ],
  stateMutability: "view",
  type: "function",
};

const decimalsAbi = {
  inputs: [],
  name: "decimals",
  outputs: [{ name: "", type: "uint8" }],
  stateMutability: "view",
  type: "function",
};

/**
 * Read Chainlink BRL/USD price from Polygon (cross-chain safe).
 * Always reads from Polygon regardless of which chain's TVL we're computing.
 * Returns the USD value of 1 BRL (e.g., ~0.175).
 */
async function getBrlUsdRate() {
  const [roundData, oracleDecimals] = await Promise.all([
    sdk.api.abi.call({
      target: chainlinkBrlUsd,
      abi: latestRoundDataAbi,
      chain: "polygon",
    }),
    sdk.api.abi.call({
      target: chainlinkBrlUsd,
      abi: decimalsAbi,
      chain: "polygon",
    }),
  ]);

  const answer = Number(roundData.output.answer);
  const feedDec = Number(oracleDecimals.output);
  const rate = answer / 10 ** feedDec;

  // Sanity: BRL/USD should be between 0.10 and 0.40
  if (rate < 0.10 || rate > 0.40) {
    throw new Error(`BRL/USD rate ${rate} out of expected range`);
  }

  return rate;
}

/**
 * Polygon TVL: totalSupply of efixDI on Polygon, converted to USD via Chainlink.
 */
async function polygonTvl(api) {
  const totalSupply = await api.call({
    target: efixDIPolygon,
    abi: "erc20:totalSupply",
  });

  const brlUsd = await getBrlUsdRate();

  // Convert: totalSupply (18 dec) * brlUsd → USDC equivalent (6 dec)
  const supplyInTokens = Number(totalSupply) / 1e18;
  const usdcEquivalent = Math.floor(supplyInTokens * brlUsd * 1e6);

  api.add(USDC_POLYGON, usdcEquivalent);
}

/**
 * Base TVL: totalSupply of efixDI on Base, converted to USD via Chainlink.
 * Tokens arrive via LayerZero V2 OFT bridge (after source-chain burn)
 * or directly for DeFi use. Used as Morpho Blue collateral.
 */
async function baseTvl(api) {
  const totalSupply = await api.call({
    target: efixDIBase,
    abi: "erc20:totalSupply",
  });

  // Cross-chain call: read BRL/USD from Polygon Chainlink
  const brlUsd = await getBrlUsdRate();

  const supplyInTokens = Number(totalSupply) / 1e18;
  const usdcEquivalent = Math.floor(supplyInTokens * brlUsd * 1e6);

  api.add(USDC_BASE, usdcEquivalent);
}

module.exports = {
  methodology:
    "TVL is the total supply of efixDI tokens on each chain, priced via Chainlink BRL/USD oracle. " +
    "Each efixDI token is backed 1:1 by Brazilian DI fund shares (CDI rate). " +
    "On Polygon, tokens are minted when users deposit BRL via PIX. " +
    "On Base, tokens are minted via LayerZero V2 OFT bridge (after burn) or directly for DeFi use.",
  misrepresentedTokens: true,
  doublecounted: false,
  start: 1769990400, // Feb 2, 2026 — VaultV2 deployment
  polygon: {
    tvl: polygonTvl,
  },
  base: {
    tvl: baseTvl,
  },
};
