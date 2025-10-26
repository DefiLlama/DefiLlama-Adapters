const { getBalance, sumTokens } = require('../helper/chain/cosmos');
const abi = require('./abi.json');

// Extract configuration from ABI
const { contracts, tokens, protocol } = abi;
const JURIS_STAKING_CONTRACT = contracts.staking;
const JURIS_TOKEN_CONTRACT = contracts.token;

// Staking helper function - tracks governance token staking
function stakingHelper(stakingContract, governanceToken) {
  return async function(api) {
    try {
      console.log(`📊 Querying staking for governance token...`);
      
      const balance = await getBalance({
        token: governanceToken,
        owner: stakingContract,
        chain: 'terra'
      });
      
      if (balance > 0) {
        api.add(governanceToken, balance);
        console.log(`✅ Governance token staked: ${balance}`);
      }
      
    } catch (error) {
      console.error('🚨 Staking calculation error:', error.message);
    }
  };
}

// TVL function - tracks all protocol assets
async function tvl(api) {
  try {
    console.log('🔍 Calculating Juris Protocol TVL...');
    
    // Native tokens (LUNC & USTC) held by staking contract
    await sumTokens({
      api,
      owner: JURIS_STAKING_CONTRACT,
      tokens: [tokens.LUNC.address, tokens.USTC.address]
    });
    
    // JURIS governance tokens held by staking contract
    try {
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
      console.log('❌ JURIS balance query failed:', error.message);
    }
    
  } catch (error) {
    console.error('🚨 TVL calculation error:', error.message);
  }
}

module.exports = {
  // Core functions
  tvl,
  staking: stakingHelper(JURIS_STAKING_CONTRACT, JURIS_TOKEN_CONTRACT),
  
  // Valid metadata keys only
  methodology: `${protocol.description}. TVL includes all ${tokens.JURIS.symbol}, ${tokens.LUNC.symbol}, and ${tokens.USTC.symbol} tokens in protocol contracts. Staking tracks ${tokens.JURIS.symbol} governance token positions.`,
  timetravel: false,
  misrepresentedTokens: false,
  doublecounted: false,
  start: 1707782400,
  
  // CoinGecko price mappings (these go at root level)
  [`terra:${JURIS_TOKEN_CONTRACT}`]: tokens.JURIS.coingeckoId,
  [`terra:${tokens.LUNC.address}`]: tokens.LUNC.coingeckoId,  
  [`terra:${tokens.USTC.address}`]: tokens.USTC.coingeckoId,
  
  // Chain-specific exports
  terra: {
    tvl,
    staking: stakingHelper(JURIS_STAKING_CONTRACT, JURIS_TOKEN_CONTRACT)
  }
};
