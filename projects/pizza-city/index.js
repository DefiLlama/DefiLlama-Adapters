/**
 * Pizza City - DefiLlama TVL Adapter
 * 
 * Submit to: https://github.com/DefiLlama/DefiLlama-Adapters
 * Folder: projects/pizza-city/index.js
 * 
 * Chain: Base (chainId: 8453)
 * Website: https://pizzacity.app
 */

const { sumTokens2 } = require('../helper/unwrapLPs');

const CONTRACTS = {
  PIZZA_TOKEN: '0x13b628fF6Db92070C0FBad79523240E0f5DeFb07',
  PIZZA_STAKING: '0x2166Ea481f03778c969667675dBD6A4FdAa9FE78',
  PIZZA_POL_MANAGER: '0x2f90126a7a35351D8C522aa751059e77cF477C2B',
  UNISWAP_V3_NFT_MANAGER: '0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1',
};

/**
 * Staking TVL - PIZZA tokens staked for rewards and governance
 */
async function staking(api) {
  return sumTokens2({
    api,
    owner: CONTRACTS.PIZZA_STAKING,
    tokens: [CONTRACTS.PIZZA_TOKEN],
  });
}

/**
 * Pool2 TVL - Protocol-Owned Liquidity (permanently locked Uniswap V3 LP)
 * This liquidity can never be withdrawn - only added to.
 */
async function pool2(api) {
  const tokenId = await api.call({
    abi: 'uint256:fullRangeTokenId',
    target: CONTRACTS.PIZZA_POL_MANAGER,
  });
  
  if (!tokenId || Number(tokenId) === 0) {
    return {};
  }
  
  return sumTokens2({
    api,
    resolveUniV3: true,
    uniV3ExtraConfig: {
      nftAddress: CONTRACTS.UNISWAP_V3_NFT_MANAGER,
      positionIds: [tokenId],
    },
  });
}

module.exports = {
  methodology: `
    Pizza City is a gamified DeFi protocol on Base featuring Dutch auctions.
    
    TVL Components:
    - Staking: PIZZA tokens staked for rewards and governance power
    - Pool2: Permanently locked Uniswap V3 PIZZA/WETH liquidity (protocol-owned, cannot be withdrawn)
    
    Note: Treasury holdings are tracked separately via treasury adapter.
    15% of auction revenue is converted to permanently locked LP.
  `,
  base: {
    tvl: async () => ({}), // No user-deposited TVL, see staking/pool2
    staking,
    pool2,
  },
};
