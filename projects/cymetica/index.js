/**
 * DeFiLlama TVL Adapter for Cymetica
 *
 * Cymetica is a decentralized prediction market platform on Base.
 * This adapter calculates TVL from:
 * 1. wVAIX collateral in prediction markets
 * 2. Liquidity in Aerodrome pools
 * 3. Platform treasury holdings
 *
 * To submit:
 * 1. Fork https://github.com/DefiLlama/DefiLlama-Adapters
 * 2. Add this file to projects/cymetica/index.js
 * 3. Submit PR
 */

const { sumTokens2 } = require('../helper/unwrapLPs');

// Contract addresses on Base
const CONTRACTS = {
  // wVAIX token
  wVAIX: '0x5134C080Be86322CE77C344e2C88599F9A84E5c2',

  // Aerodrome wVAIX/WETH pool
  AERODROME_POOL: '0x16266a04b0c03a30f30867c89703729bf126d085',

  // Supply Chain Factory (holds market collateral)
  SUPPLY_CHAIN_FACTORY: '0xFeE351D2f0d0337661EF82766868b690030055D3',

  // Perpetual Factory
  PERPETUAL_FACTORY: '0x3466e9a644A9CAF2Bef46c23c6b44D5AfBDf3719',

  // Treasury
  TREASURY: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
};

// Standard tokens
const WETH = '0x4200000000000000000000000000000000000006';
const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

/**
 * Calculate TVL for Cymetica on Base
 */
async function tvl(api) {
  // Get wVAIX balance in key contracts
  const ownerTokens = [
    // wVAIX in Supply Chain Factory
    [CONTRACTS.wVAIX, CONTRACTS.SUPPLY_CHAIN_FACTORY],
    // wVAIX in Perpetual Factory
    [CONTRACTS.wVAIX, CONTRACTS.PERPETUAL_FACTORY],
    // WETH in Treasury
    [WETH, CONTRACTS.TREASURY],
    // USDC in Treasury
    [USDC, CONTRACTS.TREASURY],
  ];

  return sumTokens2({ api, ownerTokens });
}

/**
 * Calculate staking TVL (if applicable)
 */
async function staking(api) {
  // Currently no staking mechanism
  // Add when staking is implemented
  return {};
}

/**
 * Calculate pool2 TVL (LP tokens)
 */
async function pool2(api) {
  // Aerodrome pool liquidity
  return sumTokens2({
    api,
    owners: [CONTRACTS.AERODROME_POOL],
    tokens: [CONTRACTS.wVAIX, WETH],
  });
}

module.exports = {
  methodology: 'TVL is calculated as the sum of wVAIX collateral locked in prediction market contracts, plus treasury holdings in WETH and USDC.',
  base: {
    tvl,
    // staking,  // Uncomment when staking is implemented
    // pool2,    // Uncomment to include LP positions
  },
  hallmarks: [
    [1735142400, 'Cymetica Launch on Base'], // Dec 25, 2025
  ],
};
