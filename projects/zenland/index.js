const { sumTokens2 } = require("../helper/unwrapLPs");
const { getLogs2 } = require("../helper/cache/getLogs");

/**
 * Zenland V2 - Decentralized Escrow Protocol
 * TVL Adapter for DefiLlama
 * 
 * TVL: Funds locked in active escrow contracts (USDC, USDT)
 * Staking: Agent stakes in AgentRegistry (reported separately)
 * 
 * Note: Treasury holdings are protocol-owned and excluded from TVL per DefiLlama conventions.
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
 * Includes only: Funds locked in active escrow contracts
 * 
 * Note: Agent stakes are reported separately via staking().
 * Treasury is excluded per DefiLlama conventions (protocol-owned liquidity).
 */
async function tvl(api) {
  const tokens = Object.values(TOKENS);

  // Get all escrow addresses from EscrowCreated events
  const logs = await getLogs2({
    api,
    target: ESCROW_FACTORY,
    eventAbi: ESCROW_CREATED_EVENT,
    fromBlock: FROM_BLOCK,
  });
  
  const escrowAddresses = logs.map((log) => log.escrow);

  // Build token-owner pairs for escrow balances only
  const tokensAndOwners = [];
  
  for (const escrow of escrowAddresses) {
    for (const token of tokens) {
      tokensAndOwners.push([token, escrow]);
    }
  }

  // Sum escrow token balances
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
  methodology: "TVL counts funds locked in active escrow contracts. Staking represents agent stakes in the AgentRegistry (reported separately). Treasury holdings are protocol-owned and excluded from TVL.",
  start: "2026-02-10",
  ethereum: {
    tvl,
    staking,
  },
};
