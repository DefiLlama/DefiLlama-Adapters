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
      console.log('📊 Calculating governance token staking...');
      
      const balance = await getBalance({
        token: governanceToken,
        owner: stakingContract,
        chain: 'terra'
      });
      
      if (balance > 0) {
        api.add(governanceToken, balance);
        console.log(`✅ JURIS staked: ${balance}`);
      }
      
    } catch (error) {
      console.error('Staking calculation error:', error.message);
    }
  };
}

// TVL function - tracks all protocol assets
async function tvlFunction(api) {
  try {
    console.log('🔍 Calculating total protocol TVL...');
    
    // Native tokens (LUNC & USTC) held by staking contract
    await sumTokens({
      api,
      owner: JURIS_STAKING_CONTRACT,
      tokens: [tokens.LUNC.address, tokens.USTC.address]
    });
    
    // JURIS governance tokens held by staking contract
    const jurisBalance = await getBalance({
      token: JURIS_TOKEN_CONTRACT,
      owner: JURIS_STAKING_CONTRACT,
      chain: 'terra'
    });
    
    if (jurisBalance > 0) {
      api.add(JURIS_TOKEN_CONTRACT, jurisBalance);
      console.log(`✅ JURIS TVL: ${jurisBalance}`);
    }
    
    console.log('📊 TVL calculation complete');
    
  } catch (error) {
    console.error('TVL calculation error:', error.message);
  }
}

module.exports = {
  // Global metadata (valid keys only)
  methodology: `${protocol.description}. TVL includes ${tokens.JURIS.symbol} (${tokens.JURIS.decimals} decimals), ${tokens.LUNC.symbol}, and ${tokens.USTC.symbol} tokens staked in the protocol on Terra Classic.`,
  timetravel: false,
  misrepresentedTokens: false,
  doublecounted: false,
  start: 1707782400,
  
  // CoinGecko price mappings (at root level)
  [`terra:${JURIS_TOKEN_CONTRACT}`]: tokens.JURIS.coingeckoId,
  [`terra:${tokens.LUNC.address}`]: tokens.LUNC.coingeckoId,
  [`terra:${tokens.USTC.address}`]: tokens.USTC.coingeckoId,
  
  // Chain-specific exports (NEW SPEC - tvl/staking INSIDE chain)
  terra: {
    tvl: tvlFunction,
    staking: stakingHelper(JURIS_STAKING_CONTRACT, JURIS_TOKEN_CONTRACT)
  }
  
  // Optional: Add when lending goes live
  // hallmarks: [
  //   [1707782400, "Protocol Launch"],
  //   [1715040000, "Native Staking Added"]
  // ]
};
