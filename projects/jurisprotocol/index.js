const { queryContract } = require('../helper/chain/cosmos');
const { getTokenDenomPrice } = require('../helper/tokenMapping');

// Juris Protocol contract addresses on Terra Classic
const JURIS_STAKING_CONTRACT = ''; // You'll provide this later
const TERRA_CLASSIC_CHAIN_ID = 'columbus-5';

// Terra Classic native token addresses
const LUNC_TOKEN = 'uluna'; // Terra Classic LUNA (LUNC)
const USTC_TOKEN = 'uusd';  // Terra Classic USD (USTC)

async function staking(api) {
  const balances = {};
  
  if (!JURIS_STAKING_CONTRACT) {
    throw new Error('Juris staking contract address not provided yet');
  }
  
  try {
    // Query the staking contract for total staked tokens
    // This is a generic query - you'll need to adjust based on your actual contract structure
    const stakingInfo = await queryContract({
      contract: JURIS_STAKING_CONTRACT,
      chain: TERRA_CLASSIC_CHAIN_ID,
      data: { staking_info: {} } // Adjust this query based on your contract's query methods
    });
    
    // If staking info includes LUNC tokens staked
    if (stakingInfo.total_staked_lunc) {
      api.add(LUNC_TOKEN, stakingInfo.total_staked_lunc);
    }
    
    // If staking info includes other tokens (adjust based on your protocol)
    if (stakingInfo.total_staked_ustc) {
      api.add(USTC_TOKEN, stakingInfo.total_staked_ustc);
    }
    
    // Query for any additional token pools if your protocol supports multiple tokens
    const poolsInfo = await queryContract({
      contract: JURIS_STAKING_CONTRACT,
      chain: TERRA_CLASSIC_CHAIN_ID,
      data: { pools: {} }
    });
    
    if (poolsInfo && poolsInfo.pools) {
      poolsInfo.pools.forEach(pool => {
        if (pool.denom && pool.amount) {
          api.add(pool.denom, pool.amount);
        }
      });
    }
    
  } catch (error) {
    console.error('Error fetching Juris Protocol staking data:', error);
    // Return empty balances if contract query fails
    return balances;
  }
  
  return balances;
}

// Alternative TVL function if you want to track total value locked instead of just staking
async function tvl(api) {
  // For now, TVL equals staking since you mentioned you're currently running staking only
  return staking(api);
}

module.exports = {
  timetravel: true, // Set to false if your contract doesn't support historical queries
  misrepresentedTokens: false,
  methodology: 'Juris Protocol TVL is calculated by summing all tokens staked in the staking contracts on Terra Classic. Currently includes native LUNC staking with plans to expand to lending functionality.',
  start: Math.floor(Date.now() / 1000), // Replace with your actual launch timestamp
  terra: {
    staking,
    tvl
  }
};
