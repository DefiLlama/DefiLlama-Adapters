const { queryContract, getBalance, sumTokens } = require('../helper/chain/cosmos');

// Juris Protocol contract addresses on Terra Classic
const JURIS_STAKING_CONTRACT = "terra1rta0rnaxz9ww6hnrj9347vdn66gkgxcmcwgpm2jj6qulv8adc52s95qa5y";
const JURIS_TOKEN_CONTRACT = "terra1vhgq25vwuhdhn9xjll0rhl2s67jzw78a4g2t78y5kz89q9lsdskq2pxcj2";

// Native Terra Classic token denominations
const LUNC_DENOM = 'uluna';
const USTC_DENOM = 'uusd';

async function tvl(api) {
  try {
    console.log('🔍 Querying Juris Protocol staking contract...');
    
    // Method 1: Direct contract balance approach (most reliable)
    // This checks what tokens the staking contract actually holds
    await Promise.all([
      // Query native LUNC and USTC tokens held by staking contract
      sumTokens({
        api,
        owner: JURIS_STAKING_CONTRACT,
        tokens: [LUNC_DENOM, USTC_DENOM]
      }),
      
      // Query JURIS CW20 token balance held by staking contract
      (async () => {
        try {
          const jurisBalance = await getBalance({
            token: JURIS_TOKEN_CONTRACT,
            owner: JURIS_STAKING_CONTRACT,
            chain: 'terra'
          });
          
          if (jurisBalance > 0) {
            api.add(JURIS_TOKEN_CONTRACT, jurisBalance);
            console.log('✅ JURIS balance found:', jurisBalance);
          }
        } catch (error) {
          console.log('❌ JURIS balance query failed:', error.message);
        }
      })()
    ]);
    
    // Method 2: Contract state query (supplementary data)
    // This checks if the contract exposes additional staking info
    try {
      const contractQueries = [
        {},                    // Empty query (most common)
        { state: {} },         // State query
        { config: {} },        // Config query  
        { staking_info: {} },  // Staking info query
        { pool_info: {} },     // Pool info query
        { total_staked: {} }   // Total staked query
      ];
      
      let contractData = null;
      
      for (const query of contractQueries) {
        try {
          const result = await queryContract({
            contract: JURIS_STAKING_CONTRACT,
            chain: 'terra',
            data: query
          });
          
          if (result && Object.keys(result).length > 0) {
            contractData = result;
            console.log('✅ Contract query successful:', JSON.stringify(query), result);
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      // Parse contract response if available
      if (contractData) {
        // Handle various possible field names for staking data
        const stakeFields = [
          // JURIS token fields
          'total_juris_staked', 'juris_staked', 'total_staked', 'staked_amount',
          'total_juris_balance', 'juris_balance', 'total_balance',
          
          // LUNC fields  
          'total_lunc_staked', 'lunc_staked', 'total_lunc_balance', 'lunc_balance',
          'total_uluna_staked', 'uluna_staked', 'total_uluna_balance', 'uluna_balance',
          
          // USTC fields
          'total_ustc_staked', 'ustc_staked', 'total_ustc_balance', 'ustc_balance', 
          'total_uusd_staked', 'uusd_staked', 'total_uusd_balance', 'uusd_balance'
        ];
        
        // Parse all fields and add appropriate tokens
        Object.entries(contractData).forEach(([key, value]) => {
          const numValue = Number(value);
          if (numValue > 0) {
            // JURIS token detection
            if (key.toLowerCase().includes('juris') || 
                (key === 'total_staked' && !key.includes('lunc') && !key.includes('ustc'))) {
              api.add(JURIS_TOKEN_CONTRACT, numValue);
              console.log(`✅ Added ${numValue} JURIS from field: ${key}`);
            }
            // LUNC detection
            else if (key.toLowerCase().includes('lunc') || key.toLowerCase().includes('uluna')) {
              api.add(LUNC_DENOM, numValue);
              console.log(`✅ Added ${numValue} LUNC from field: ${key}`);
            }
            // USTC detection  
            else if (key.toLowerCase().includes('ustc') || key.toLowerCase().includes('uusd')) {
              api.add(USTC_DENOM, numValue);
              console.log(`✅ Added ${numValue} USTC from field: ${key}`);
            }
          }
        });
        
        // Handle nested structures (common in CosmWasm contracts)
        if (contractData.state) {
          Object.entries(contractData.state).forEach(([key, value]) => {
            const numValue = Number(value);
            if (numValue > 0) {
              if (key.toLowerCase().includes('juris')) {
                api.add(JURIS_TOKEN_CONTRACT, numValue);
              } else if (key.toLowerCase().includes('lunc') || key.toLowerCase().includes('uluna')) {
                api.add(LUNC_DENOM, numValue);
              } else if (key.toLowerCase().includes('ustc') || key.toLowerCase().includes('uusd')) {
                api.add(USTC_DENOM, numValue);
              }
            }
          });
        }
      }
      
    } catch (error) {
      console.log('⚠️ Contract state query failed (non-critical):', error.message);
    }
    
    // Log final balances for debugging
    const balances = api.getBalances();
    console.log('📊 Final Juris Protocol TVL:', balances);
    
  } catch (error) {
    console.error('🚨 Juris Protocol TVL calculation failed:', error.message);
    // Don't throw - let the adapter return partial results
  }
}

// Staking-specific function (optional, but good practice)
async function staking(api) {
  // For staking protocols, staking TVL usually equals total TVL
  await tvl(api);
}

module.exports = {
  timetravel: false, // Set to true once you verify historical data works
  misrepresentedTokens: false,
  methodology: 'Juris Protocol TVL tracks LUNC, USTC, and JURIS tokens staked in the staking contract on Terra Classic. Uses both direct balance queries and contract state analysis for comprehensive coverage.',
  start: 1698796800, // Update with your actual launch timestamp
  terra: {
    tvl,
    staking // Now properly defined
  }
};
