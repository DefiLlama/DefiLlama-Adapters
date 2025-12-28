/**
 * Pizza City - DefiLlama TVL Adapter
 * 
 * Submit to: https://github.com/DefiLlama/DefiLlama-Adapters
 * Folder: projects/pizza-city/index.js
 * 
 * Chain: Base (chainId: 8453)
 */

const { sumTokens2 } = require('../helper/unwrapLPs');
const ADDRESSES = require('../helper/coreAssets.json');

// ═══════════════════════════════════════════════════════════════════════════════
// CONTRACT ADDRESSES (Base Mainnet)
// ═══════════════════════════════════════════════════════════════════════════════

const CONTRACTS = {
  // Core token
  PIZZA_TOKEN: '0x13b628fF6Db92070C0FBad79523240E0f5DeFb07',
  
  // Staking - PIZZA locked for rewards + governance power
  PIZZA_STAKING: '0x2166Ea481f03778c969667675dBD6A4FdAa9FE78',
  
  // POL Manager - owns the Uniswap V3 LP NFT position
  PIZZA_POL_MANAGER: '0x2f90126a7a35351D8C522aa751059e77cF477C2B',
  
  // Uniswap V3 Position Manager (for reading LP positions)
  UNISWAP_V3_NFT_MANAGER: '0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1',
  
  // Treasury - holds ETH revenue before conversion to LP
  PIZZA_TREASURY: '0xc6b4694b906EA134595D3400364d7Acc319684ec',
};

// First round started at this block (Dec 19, 2025 ~6PM UTC)
const START_BLOCK = 39689118;

// WETH on Base
const WETH = ADDRESSES.base.WETH;

// ═══════════════════════════════════════════════════════════════════════════════
// TVL FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Main TVL - Treasury holdings (ETH waiting to be processed into LP)
 */
async function tvl(api) {
  return sumTokens2({
    api,
    owner: CONTRACTS.PIZZA_TREASURY,
    tokens: [WETH],
  });
}

/**
 * Staking TVL - PIZZA tokens staked
 */
async function staking(api) {
  return sumTokens2({
    api,
    owner: CONTRACTS.PIZZA_STAKING,
    tokens: [CONTRACTS.PIZZA_TOKEN],
  });
}

/**
 * Pool2 TVL - Protocol-Owned Liquidity (permanently locked V3 LP)
 * Reads the V3 position using the stored tokenId
 */
async function pool2(api) {
  // Get the NFT token ID for the locked LP position
  const tokenId = await api.call({
    abi: 'uint256:fullRangeTokenId',
    target: CONTRACTS.PIZZA_POL_MANAGER,
  });
  
  // If no position exists yet, return empty
  if (!tokenId || Number(tokenId) === 0) {
    return {};
  }
  
  // Use sumTokens2 with uniV3ExtraConfig to unwrap specific position
  return sumTokens2({
    api,
    resolveUniV3: true,
    uniV3ExtraConfig: {
      nftAddress: CONTRACTS.UNISWAP_V3_NFT_MANAGER,
      positionIds: [tokenId],
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
  methodology: `
    Pizza City is a gamified DeFi protocol on Base featuring Dutch auctions.
    
    TVL breakdown:
    - Treasury: ETH held awaiting conversion to permanent liquidity (15% of auction revenue)
    - Staking: PIZZA tokens staked for rewards and governance power
    - Pool2: Permanently locked Uniswap V3 PIZZA/WETH liquidity (protocol-owned)
    
    Auction revenue distribution:
    - 80% to Boss Bakers (previous round winners)
    - 15% to Treasury (builds permanent liquidity)
    - 5% to Street Fees (UI/referrals)
    - 0.1% to Settler (transaction executor)
  `,
  start: START_BLOCK,
  base: {
    tvl,
    staking,
    pool2,
  },
};
