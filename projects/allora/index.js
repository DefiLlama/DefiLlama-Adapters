const { get } = require('../helper/http');
const { queryV1Beta1 } = require('../helper/chain/cosmos');

// Contract addresses for bridged ALLO tokens on EVM chains
const ALLO_CONTRACTS = {
  ethereum: '0x8408D45b61f5823298F19a09B53b7339c0280489',
  base: '0x032d86656Db142138AC97d2c5C4E3766E8c0482d',
  bsc: '0xCCe5F304fD043d6A4E8cCB5376A4a4Fb583B98d5'
};

// Allora mainnet endpoints
// NOTE: These need to be added to helper/chain/cosmos.js endPoints object
// For now using placeholder - DefiLlama team will add official endpoint
const ALLORA_REST_API = 'https://allora-mainnet-api.polkachu.com'; // Update with actual REST endpoint

/**
 * Fetch Cosmos SDK standard staking (validator staking) from Allora Chain
 * Uses the standard /cosmos/staking/v1beta1/pool endpoint
 */
async function getCosmosStaking() {
  try {
    // Query the standard Cosmos SDK staking pool
    // queryV1Beta1 will prepend 'cosmos' to the URL automatically
    const pool = await queryV1Beta1({ 
      chain: 'allora',
      url: 'staking/v1beta1/pool' 
    });
    
    if (!pool || !pool.pool) {
      console.log('Allora: Unable to fetch staking pool data');
      return '0';
    }

    // bonded_tokens is in uallo (18 decimals, NOT 6 like most Cosmos chains!)
    const bondedTokens = pool.pool.bonded_tokens || '0';
    
    // Return as raw amount
    return bondedTokens;
  } catch (error) {
    console.log(`Allora chain staking fetch error: ${error.message}`);
    return '0';
  }
}

/**
 * Fetch Allora-specific reputational staking (Workers and Reputers)
 * This queries Allora's custom module for non-validator staking
 * 
 * NOTE: The custom emissions endpoint is not yet available via REST API.
 * Once Allora exposes the total worker/reputer stake via REST, update this function.
 * For now, this returns 0 and only validator staking is tracked.
 */
async function getReputationalStaking(api) {
  // TODO: Update once Allora team provides REST endpoint for worker/reputer staking
  // Expected endpoints to try:
  // - /allora/emissions/v4/total_stake
  // - /emissions/v4/network_loss/total_stake
  // - Check Allora documentation for correct path
  
  console.log('Allora: Reputational staking endpoint not yet implemented in REST API');
  return '0';
}



/**
 * Main TVL function for Allora Chain
 * For Cosmos chain, TVL is typically 0 as staking is tracked separately
 */
async function tvl(api) {
  // Allora chain TVL is tracked via staking
  // This function can be expanded if there are other locked assets on-chain
}

/**
 * Staking-specific function
 * Returns all staked ALLO on Allora Chain (validators + reputers + workers)
 */
async function staking() {
  const validatorStaking = await getCosmosStaking();
  const reputationalStaking = await getReputationalStaking();
  
  // Add the two string values (both in uallo with 18 decimals)
  const totalStakedUallo = BigInt(validatorStaking) + BigInt(reputationalStaking);
  
  // Convert from uallo (18 decimals) to ALLO
  // Divide by 1,000,000,000,000,000,000 using BigInt division
  const totalStakedAllo = totalStakedUallo / BigInt(1e18);
  
  // Convert to number - this is safe now as we've already divided by 1e18
  return {
    'allora': Number(totalStakedAllo)
  };
}

module.exports = {
  methodology: `Allora Network TVL includes: 
    1. Validator staking on Allora Chain (Cosmos SDK standard staking)
    2. Reputational staking for Workers and Reputers (Allora's custom staking module)
    3. Bridged ALLO tokens on Ethereum, Base, and BSC via LayerZero OFT standard
    
    Total staked ALLO tokens secure the decentralized AI intelligence network.`,
  
  timetravel: false, // Cosmos chains don't support historical queries by default
  
  // Allora is a Cosmos chain - track it separately
  allora: {
    tvl,
    staking
  },
  
  // Track bridged tokens on their respective EVM chains
  ethereum: {
    tvl: async (api) => {
      const totalSupply = await api.call({
        target: ALLO_CONTRACTS.ethereum,
        abi: 'erc20:totalSupply',
      });
      api.add(ALLO_CONTRACTS.ethereum, totalSupply);
    }
  },
  
  base: {
    tvl: async (api) => {
      const totalSupply = await api.call({
        target: ALLO_CONTRACTS.base,
        abi: 'erc20:totalSupply',
      });
      api.add(ALLO_CONTRACTS.base, totalSupply);
    }
  },
  
  bsc: {
    tvl: async (api) => {
      const totalSupply = await api.call({
        target: ALLO_CONTRACTS.bsc,
        abi: 'erc20:totalSupply',
      });
      api.add(ALLO_CONTRACTS.bsc, totalSupply);
    }
  },
  
  hallmarks: [
    [1731283200, "Mainnet Launch"], // November 11, 2024 (timestamp in seconds)
  ],
};
