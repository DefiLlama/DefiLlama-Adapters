const { sumTokens2 } = require("../helper/unwrapLPs");
const { getLogs2 } = require("../helper/cache/getLogs");

/**
 * Zenland V2 - Decentralized Escrow Protocol
 * TVL Adapter for DefiLlama
 * 
 * TVL Components:
 * 1. Active Escrows - Funds locked in escrow contracts (USDC, USDT)
 * 2. Agent Stakes - Stablecoins staked in AgentRegistry
 * 3. Treasury - DAO treasury holdings (included in main TVL)
 * 
 * Contracts (Ethereum Mainnet):
 * - EscrowFactory: 0x11c6bb595824014e1c11c6b4a6ad2095cf7d22ab
 * - AgentRegistry: 0xb528f6ba2d75c383dfe6cdab9957a6cd6b45d90d
 * - Treasury: 0xcF3f26F73AEc469dfc5a0940b157214fD730B0FB
 * - FeeManager: 0x9c364b9b5020bc63e074d43f7c68493c0bbdb0cd
 * 
 * Whitelisted Tokens:
 * - USDC: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
 * - USDT: 0xdAC17F958D2ee523a2206206994597C13D831ec7
 */

// Contract addresses
const ESCROW_FACTORY = "0x11c6bb595824014e1c11c6b4a6ad2095cf7d22ab";
const AGENT_REGISTRY = "0xb528f6ba2d75c383dfe6cdab9957a6cd6b45d90d";
const TREASURY = "0xcF3f26F73AEc469dfc5a0940b157214fD730B0FB";
const FROM_BLOCK = 24426849; // Deployment block

// Whitelisted stablecoins
const TOKENS = {
  USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
};

// Event ABI for EscrowCreated
const ESCROW_CREATED_EVENT = "event EscrowCreated(address indexed escrow, address indexed buyer, address indexed seller, address agent, address token, uint256 amount, uint256 creationFee, uint256 version)";

/**
 * Main TVL calculation
 * Includes: Active escrows + Agent stakes + Treasury
 */
async function tvl(api) {
  const tokens = Object.values(TOKENS);

  // 1. Get all escrow addresses from EscrowCreated events
  const logs = await getLogs2({
    api,
    target: ESCROW_FACTORY,
    eventAbi: ESCROW_CREATED_EVENT,
    fromBlock: FROM_BLOCK,
  });
  
  const escrowAddresses = logs.map((log) => log.escrow);

  // 2. Build token-owner pairs for all components
  const tokensAndOwners = [];
  
  // Add escrow balances
  for (const escrow of escrowAddresses) {
    for (const token of tokens) {
      tokensAndOwners.push([token, escrow]);
    }
  }

  // Add AgentRegistry balances (agent stakes)
  for (const token of tokens) {
    tokensAndOwners.push([token, AGENT_REGISTRY]);
  }

  // Add Treasury balances
  for (const token of tokens) {
    tokensAndOwners.push([token, TREASURY]);
  }

  // Sum all token balances
  return sumTokens2({ api, tokensAndOwners });
}

/**
 * Staking TVL - Agent stakes in AgentRegistry
 * Separated for DeFiLlama's staking category
 */
async function staking(api) {
  const tokens = Object.values(TOKENS);

  const tokensAndOwners = [];
  for (const token of tokens) {
    tokensAndOwners.push([token, AGENT_REGISTRY]);
  }

  return sumTokens2({ api, tokensAndOwners });
}

module.exports = {
  methodology: "TVL includes: (1) Funds locked in active escrow contracts, (2) Agent stakes in the AgentRegistry, (3) DAO Treasury holdings.",
  start: "2026-02-10",
  ethereum: {
    tvl,
    staking,
  },
};
