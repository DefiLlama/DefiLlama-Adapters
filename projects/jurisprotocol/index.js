const { getBalance, sumTokens } = require('../helper/chain/cosmos');
const abi = require('./abi.json');

// Extract configuration from ABI
const { contracts, tokens, protocol } = abi;
const JURIS_STAKING_CONTRACT = contracts.staking;
const JURIS_TOKEN_CONTRACT = contracts.token;

// TVL function - tracks all protocol assets
async function tvl(api) {
  try {
    console.log('🔍 Calculating Juris Protocol TVL...');
    
    // Native tokens (LUNC & USTC) held by staking contract
    await sumTokens({
      api,
      owner: JURIS_STAKING_CONTRACT,
      tokens: [tokens.LUNC.address, tokens.USTC.address] // 'uluna', 'uusd'
    });
    
    // JURIS CW20 tokens held by staking contract
    const jurisBalance = await getBalance({
      token: JURIS_TOKEN_CONTRACT,
      owner: JURIS_STAKING_CONTRACT,
      chain: 'terra'
    });
    
    if (jurisBalance > 0) {
      api.add(JURIS_TOKEN_CONTRACT, jurisBalance);
      console.log(`✅ JURIS balance: ${jurisBalance}`);
    }
    
  } catch (error) {
    console.error('TVL calculation error:', error.message);
  }
}

// Staking function - tracks governance token staking
async function staking(api) {
  try {
    console.log('📊 Calculating governance token staking...');
    
    // Only JURIS governance tokens for staking metric
    const jurisBalance = await getBalance({
      token: JURIS_TOKEN_CONTRACT,
      owner: JURIS_STAKING_CONTRACT,
      chain: 'terra'
    });
    
    if (jurisBalance > 0) {
      api.add(JURIS_TOKEN_CONTRACT, jurisBalance);
      console.log(`✅ JURIS staked: ${jurisBalance}`);
    }
    
  } catch (error) {
    console.error('Staking calculation error:', error.message);
  }
}

module.exports = {
  // ONLY valid keys allowed
  methodology: `${protocol.description}. TVL includes ${tokens.JURIS.symbol} (${tokens.JURIS.decimals} decimals), ${tokens.LUNC.symbol}, and ${tokens.USTC.symbol} tokens in staking contracts on Terra Classic.`,
  timetravel: false,
  misrepresentedTokens: false,
  doublecounted: false,
  start: 1707782400, // Update with actual launch date
  
  // Chain-specific functions (ONLY)
  terra: {
    tvl,
    staking
  }
};
