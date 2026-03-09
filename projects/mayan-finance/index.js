const { sumTokens2 } = require("../helper/unwrapLPs");

// Same Swift contract address across all EVM chains
const SWIFT = "0xC38e4e6A15593f908255214653d3D947CA1c2338";

const TOKENS = {
  ethereum: [
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
  ],
  arbitrum: [
    "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // USDC native
    "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", // USDC.e
    "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", // WETH
  ],
  base: [
    "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC
    "0x4200000000000000000000000000000000000006", // WETH
  ],
  avax: [
    "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", // USDC
    "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB", // WETH.e
  ],
  bsc: [
    "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", // USDC
    "0x2170Ed0880ac9A755fd29B2688956BD959F933F8", // ETH
  ],
  polygon: [
    "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // USDC.e
    "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", // USDC native
  ],
  optimism: [
    "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", // USDC
    "0x4200000000000000000000000000000000000006", // WETH
  ],
};

async function tvl(api) {
  const tokens = TOKENS[api.chain];
  if (!tokens) return {};
  return sumTokens2({ api, owners: [SWIFT], tokens });
}

module.exports = {
  methodology: "Tracks tokens locked in Mayan Finance Swift escrow contract (0xC38e4e6A...) across all supported EVM chains while cross-chain swaps are in-flight.",
  ethereum: { tvl },
  arbitrum: { tvl },
  base: { tvl },
  avax: { tvl },
  bsc: { tvl },
  polygon: { tvl },
  optimism: { tvl },
};
