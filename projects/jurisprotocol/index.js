const { getBalance, sumTokens } = require('../helper/chain/cosmos');

const JURIS_STAKING_CONTRACT = "terra1rta0rnaxz9ww6hnrj9347vdn66gkgxcmcwgpm2jj6qulv8adc52s95qa5y";
const JURIS_TOKEN_CONTRACT = "terra1vhgq25vwuhdhn9xjll0rhl2s67jzw78a4g2t78y5kz89q9lsdskq2pxcj2";

async function tvl(api) {
  try {
    console.log('🔍 Querying Juris Protocol staking contract...');
    
    // Query native tokens (LUNC & USTC) held by staking contract
    console.log('📊 Checking native tokens (LUNC/USTC)...');
    await sumTokens({
      api,
      owner: JURIS_STAKING_CONTRACT,
      tokens: ['uluna', 'uusd'] // LUNC and USTC native tokens
    });
    
    // Query JURIS CW20 tokens held by staking contract
    console.log('📊 Checking JURIS CW20 tokens...');
    try {
      const jurisBalance = await getBalance({
        token: JURIS_TOKEN_CONTRACT,
        owner: JURIS_STAKING_CONTRACT,
        chain: 'terra'
      });
      
      if (jurisBalance > 0) {
        api.add(JURIS_TOKEN_CONTRACT, jurisBalance);
        console.log('✅ JURIS balance found:', jurisBalance, '(raw with 6 decimals)');
      } else {
        console.log('ℹ️ No JURIS tokens found in staking contract');
      }
    } catch (error) {
      console.log('❌ JURIS balance query failed:', error.message);
    }
    
    // Log final balances for debugging
    const balances = api.getBalances();
    console.log('📊 Final TVL balances:', Object.keys(balances).length > 0 ? balances : 'No balances found');
    
  } catch (error) {
    console.error('🚨 TVL calculation error:', error.message);
  }
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: 'Juris Protocol TVL tracks JURIS tokens (6 decimals), LUNC, and USTC staked in the staking contract on Terra Classic.',
  start: 1707782400, // February 2024
  
  terra: {
    tvl
  }
};
