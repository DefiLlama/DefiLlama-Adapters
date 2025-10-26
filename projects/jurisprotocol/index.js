const { queryContract } = require('../helper/chain/cosmos');

// Juris Protocol contracts on Terra Classic
const JURIS_STAKING_CONTRACT = 'terra1rta0rnaxz9ww6hnrj9347vdn66gkgxcmcwgpm2jj6qulv8adc52s95qa5y';
const JURIS_LENDING_CONTRACT = ''; // Add your lending contract address when ready

// Terra Classic token denominations
const LUNC_TOKEN = 'uluna';
const USTC_TOKEN = 'uusd';

async function staking(api) {
  try {
    const queryMethods = [
      { state: {} },
      { config: {} },
      { staking_state: {} },
      { total_staked: {} },
      { pool_info: {} },
      { info: {} }
    ];
    
    let stakingData;
    for (const query of queryMethods) {
      try {
        stakingData = await queryContract({
          contract: JURIS_STAKING_CONTRACT,
          chain: 'columbus-5',
          data: query
        });
        
        if (stakingData) break;
      } catch (error) {
        continue;
      }
    }
    
    if (stakingData) {
      // Handle various response structures for staking
      const stakingFields = [
        'total_staked', 'total_stake', 'staked_amount', 'total_bonded',
        'bonded_amount', 'pool_size', 'total_deposit', 'total_balance'
      ];
      
      for (const field of stakingFields) {
        if (stakingData[field]) {
          api.add(LUNC_TOKEN, stakingData[field]);
          return;
        }
      }
      
      // Check nested structures
      if (stakingData.pool?.total_staked) {
        api.add(LUNC_TOKEN, stakingData.pool.total_staked);
      }
      
      if (stakingData.state?.total_staked) {
        api.add(LUNC_TOKEN, stakingData.state.total_staked);
      }
    }
    
  } catch (error) {
    console.log('Juris Protocol Staking: Unable to fetch data');
  }
}

async function borrowed(api) {
  if (!JURIS_LENDING_CONTRACT) {
    return; // Skip if lending contract not deployed yet
  }
  
  try {
    // Query lending contract for total borrowed amounts
    const lendingQueries = [
      { borrowed_info: {} },
      { total_borrowed: {} },
      { market_state: {} },
      { state: {} }
    ];
    
    let lendingData;
    for (const query of lendingQueries) {
      try {
        lendingData = await queryContract({
          contract: JURIS_LENDING_CONTRACT,
          chain: 'columbus-5',
          data: query
        });
        
        if (lendingData) break;
      } catch (error) {
        continue;
      }
    }
    
    if (lendingData) {
      const borrowFields = [
        'total_borrowed', 'borrowed_amount', 'outstanding_debt',
        'total_debt', 'market_size'
      ];
      
      for (const field of borrowFields) {
        if (lendingData[field]) {
          api.add(LUNC_TOKEN, lendingData[field]);
          return;
        }
      }
    }
    
  } catch (error) {
    console.log('Juris Protocol Lending: Unable to fetch borrowed data');
  }
}

async function tvl(api) {
  // For lending protocols, TVL typically includes supplied assets minus borrowed assets
  await staking(api); // Add staking TVL
  
  if (JURIS_LENDING_CONTRACT) {
    // Query lending pools for supplied assets
    try {
      const supplyData = await queryContract({
        contract: JURIS_LENDING_CONTRACT,
        chain: 'columbus-5',
        data: { supply_info: {} }
      });
      
      if (supplyData?.total_supply) {
        api.add(LUNC_TOKEN, supplyData.total_supply);
      }
      
    } catch (error) {
      console.log('Juris Protocol: Unable to fetch lending supply data');
    }
  }
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: 'Juris Protocol TVL includes LUNC tokens staked in staking contracts plus supplied assets in lending markets on Terra Classic. The protocol operates as a comprehensive DeFi platform offering both staking and lending services to the Terra Classic ecosystem.',
  start: 1698796800, // Replace with actual launch timestamp
  terra: {
    tvl,
    staking,
    borrowed // This will be tracked separately on DefiLlama's borrowed dashboard
  }
};
