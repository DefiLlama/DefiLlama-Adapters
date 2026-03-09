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
};

/**
 * Staking TVL - PIZZA tokens staked for rewards and governance
 * Users can unstake their PIZZA tokens at any time.
 */
async function staking(api) {
  return sumTokens2({
    api,
    owner: CONTRACTS.PIZZA_STAKING,
    tokens: [CONTRACTS.PIZZA_TOKEN],
  });
}

module.exports = {
  methodology: `
    Pizza City is a gamified DeFi protocol on Base featuring Dutch auctions.
    
    TVL: PIZZA tokens staked for rewards and governance power (user-withdrawable).
    
    Note: Protocol-owned liquidity (~$33k locked Uniswap V3 LP) is not included
    as it cannot be withdrawn by users.
  `,
  base: {
    tvl: async () => ({}),
    staking,
  },
};
