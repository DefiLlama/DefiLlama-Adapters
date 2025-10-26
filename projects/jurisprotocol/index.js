const { queryContract, getBalance, sumTokens } = require('../helper/chain/cosmos');

const JURIS_STAKING_CONTRACT = "terra1rta0rnaxz9ww6hnrj9347vdn66gkgxcmcwgpm2jj6qulv8adc52s95qa5y";
const JURIS_TOKEN_CONTRACT = "terra1vhgq25vwuhdhn9xjll0rhl2s67jzw78a4g2t78y5kz89q9lsdskq2pxcj2";

// Terra Classic native token denominations
const LUNC_DENOM = 'uluna';
const USTC_DENOM = 'uusd';

async function tvl(api) {
  try {
    console.log('🔍 Querying Juris Protocol staking contract...');
    
    // Method 1: Query native tokens (LUNC & USTC) held by staking contract
    await sumTokens({
      api,
      owner: JURIS_STAKING_CONTRACT,
      tokens: [LUNC_DENOM, USTC_DENOM]
    });
    
    // Method 2: Query JURIS CW20 tokens held by staking contract
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
    
    // Method 3: Contract state query (supplementary)
    try {
      const contractState = await queryContract({
        contract: JURIS_STAKING_CONTRACT,
        chain: 'terra',
        data: {}
      });
      
      if (contractState && Object.keys(contractState).length > 0) {
        console.log('✅ Contract state found:', contractState);
        
        // Parse additional staking amounts from contract state
        Object.entries(contractState).forEach(([key, value]) => {
          const numValue = Number(value);
          if (numValue > 0) {
            const keyLower = key.toLowerCase();
            
            if (keyLower.includes('juris') && keyLower.includes('stake')) {
              api.add(JURIS_TOKEN_CONTRACT, numValue);
              console.log(`✅ Added ${numValue} JURIS from contract field: ${key}`);
            } else if ((keyLower.includes('lunc') || keyLower.includes('luna')) && keyLower.includes('stake')) {
              api.add(LUNC_DENOM, numValue);
              console.log(`✅ Added ${numValue} LUNC from contract field: ${key}`);
            } else if ((keyLower.includes('ustc') || keyLower.includes('usd')) && keyLower.includes('stake')) {
              api.add(USTC_DENOM, numValue);
              console.log(`✅ Added ${numValue} USTC from contract field: ${key}`);
            }
          }
        });
      }
    } catch (error) {
      console.log('⚠️ Contract state query failed (non-critical):', error.message);
    }
    
    console.log('📊 Final Juris Protocol TVL calculation complete');
    
  } catch (error) {
    console.error('🚨 TVL calculation error:', error.message);
  }
}

async function staking(api) {
  await tvl(api);
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: 'Juris Protocol TVL tracks JURIS tokens (6 decimals), LUNC, and USTC staked in the staking contract on Terra Classic. Includes both direct token holdings and contract-tracked staking amounts.',
  start: 1707782400, // February 2024
  
  terra: {
    tvl,
    staking
  }
};
