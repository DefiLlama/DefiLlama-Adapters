const sdk = require('@defillama/sdk');

// =========================================================================
// PLUS Mainnet - DefiLlama TVL Adapter
// Methodology: Sums up all USDT, USDC, and ETH deposited into the 
// Universal HFT Arbitrage Bot smart contract vaults on Ethereum.
// =========================================================================

// HFT Bot Vault Smart Contract Address
const PLUS_HFT_VAULT = '0x0000000000000000000000000000000000000000'; // Replace with actual Vault if needed

// Asset Addresses (Ethereum Mainnet)
const TOKENS = {
  USDT: '0xdac17f958d2ee523a2206206994597c13d831ec7',
  USDC: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  WETH: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
};

async function tvl(timestamp, block, chainBlocks, { api }) {
  const balances = {};

  // 1. Fetch ERC20 Balances (USDT, USDC) using DefiLlama SDK
  const tokensAndOwners = [
    [TOKENS.USDT, PLUS_HFT_VAULT],
    [TOKENS.USDC, PLUS_HFT_VAULT],
    [TOKENS.WETH, PLUS_HFT_VAULT]
  ];

  await api.sumTokens({ tokensAndOwners });
  
  return api.getBalances();
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: "TVL is calculated by reading the on-chain balances of USDT, USDC, and WETH locked in the PLUS Mainnet HFT Arbitrage Bot Vault smart contract using the DefiLlama SDK.",
  ethereum: {
    tvl
  }
};
