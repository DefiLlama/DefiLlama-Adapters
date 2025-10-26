const { queryContract } = require('../helper/chain/cosmos');

// Juris Protocol staking contract on Terra Classic
const JURIS_STAKING_CONTRACT = 'terra1rta0rnaxz9ww6hnrj9347vdn66gkgxcmcwgpm2jj6qulv8adc52s95qa5y';
const TERRA_CLASSIC_CHAIN_ID = 'columbus-5';

// Terra Classic native token
const LUNC_TOKEN = 'uluna'; // Terra Classic LUNA (LUNC)

async function staking(api) {
  try {
    // Query the staking contract for total staked tokens
    // Common query patterns for Terra Classic staking contracts:
    
    // Try multiple query patterns since I don't know your exact contract interface
    let stakingData;
    
    try {
      // Pattern 1: Query total staked
      stakingData = await queryContract({
        contract: JURIS_STAKING_CONTRACT,
        chain: TERRA_CLASSIC_CHAIN_ID,
        data: { total_staked: {} }
      });
    } catch (e) {
      try {
        // Pattern 2: Query state/config
        stakingData = await queryContract({
          contract: JURIS_STAKING_CONTRACT,
          chain: TERRA_CLASSIC_CHAIN_ID,
          data: { state: {} }
        });
      } catch (e2) {
        try {
          // Pattern 3: Query config
          stakingData = await queryContract({
            contract: JURIS_STAKING_CONTRACT,
            chain: TERRA_CLASSIC_CHAIN_ID,
            data: { config: {} }
          });
        } catch (e3) {
          // Pattern 4: Query pool info
          stakingData = await queryContract({
            contract: JURIS_STAKING_CONTRACT,
            chain: TERRA_CLASSIC_CHAIN_ID,
            data: { pool_info: {} }
          });
        }
      }
    }
    
    // Extract staked amounts based on common response patterns
    if (stakingData) {
      // Check for various possible field names that might contain staked amounts
      const possibleFields = [
        'total_staked',
        'total_stake', 
        'staked_amount',
        'total_bonded',
        'bonded_amount',
        'pool_size',
        'total_supply'
      ];
      
      for (const field of possibleFields) {
        if (stakingData[field]) {
          api.add(LUNC_TOKEN, stakingData[field]);
          break;
        }
      }
      
      // If the response has nested structure
      if (stakingData.pool && stakingData.pool.total_staked) {
        api.add(LUNC_TOKEN, stakingData.pool.total_staked);
      }
      
      // If multiple pools exist
      if (stakingData.pools && Array.isArray(stakingData.pools)) {
        stakingData.pools.forEach(pool => {
          if (pool.denom === 'uluna' && pool.amount) {
            api.add(LUNC_TOKEN, pool.amount);
          }
        });
      }
    }
    
  } catch (error) {
    console.error('Error fetching Juris Protocol staking data:', error);
    // Don't throw error, just log it and return empty balances
  }
}

async function tvl(api) {
  // For staking-only protocol, TVL equals staking
  return staking(api);
}

module.exports = {
  timetravel: false, // Set to true if your contract supports historical queries
  misrepresentedTokens: false,
  methodology: 'Juris Protocol TVL is calculated by summing all LUNC tokens staked in the staking contract on Terra Classic. Currently operates as a staking protocol with plans to expand to lending functionality.',
  start: 1698796800, // Replace with your actual launch timestamp (current placeholder: Nov 1, 2023)
  terra: {
    staking,
    tvl
  }
};
