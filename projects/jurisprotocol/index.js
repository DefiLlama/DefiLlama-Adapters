const { queryContract, getBalance, sumTokens } = require('../helper/chain/cosmos');

// Juris Protocol contracts on Terra Classic
const JURIS_STAKING_CONTRACT = 'terra1rta0rnaxz9ww6hnrj9347vdn66gkgxcmcwgpm2jj6qulv8adc52s95qa5y';
const JURIS_TOKEN_CONTRACT = 'terra1vhgq25vwuhdhn9xjll0rhl2s67jzw78a4g2t78y5kz89q9lsdskq2pxcj2';

async function staking(api) {
  try {
    // Method 1: Query native tokens (LUNC, USTC) held by the staking contract
    await sumTokens({
      api,
      owner: JURIS_STAKING_CONTRACT,
      tokens: ['uluna', 'uusd'], // Native Terra Classic tokens
    });
     
    try {
      const jurisBalance = await getBalance({
        token: JURIS_TOKEN_CONTRACT,
        owner: JURIS_STAKING_CONTRACT,
        chain: 'terra'  
      });
      
      if (jurisBalance > 0) {
        api.add(JURIS_TOKEN_CONTRACT, jurisBalance);
      }
    } catch (e) {
      console.log('Juris Protocol: Could not fetch JURIS token balance:', e.message);
    }
     
    try {
      const contractState = await queryContract({
        contract: JURIS_STAKING_CONTRACT,
        chain: 'terra',
        data: { state: {} }
      });
      
      console.log('Juris staking contract state:', contractState);
       
    } catch (e) {
      console.log('Juris Protocol: Contract state query failed (this is optional):', e.message);
    }
    
  } catch (error) {
    console.log('Juris Protocol staking error:', error.message);
  }
}

async function tvl(api) {
  // For now, TVL equals staking since lending is not deployed yet
  await staking(api);
  
  // When you deploy lending contracts:
  // const JURIS_LENDING_CONTRACT = 'terra1...';
  // if (JURIS_LENDING_CONTRACT) {
  //   await sumTokens({
  //     api,
  //     owner: JURIS_LENDING_CONTRACT,
  //     tokens: ['uluna', 'uusd', JURIS_TOKEN_CONTRACT]
  //   });
  // }
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: 'Juris Protocol TVL includes LUNC, USTC, and JURIS tokens staked in the staking contract on Terra Classic.',
  start: 1698796800, 
  terra: { 
    tvl,     
    staking
  }
};
