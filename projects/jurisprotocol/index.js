const { getBalance, sumTokens } = require('../helper/chain/cosmos');
const abi = require('./abi.json');

// Extract contract addresses from ABI
const { contracts, tokens } = abi.jurisProtocol;
const JURIS_STAKING_CONTRACT = contracts.staking;
const JURIS_TOKEN_CONTRACT = contracts.token;

// Native Terra Classic token addresses
const LUNC_DENOM = tokens.LUNC.address; // 'uluna'
const USTC_DENOM = tokens.USTC.address; // 'uusd'

async function tvl(api) {
  try {
    console.log('🔍 Querying Juris Protocol staking contract...');
    console.log('📋 Contract:', JURIS_STAKING_CONTRACT);
    
    // Method 1: Query native tokens (LUNC & USTC) held by staking contract
    console.log('📊 Checking native tokens (LUNC/USTC)...');
    await sumTokens({
      api,
      owner: JURIS_STAKING_CONTRACT,
      tokens: [LUNC_DENOM, USTC_DENOM]
    });
    
    // Method 2: Query JURIS CW20 tokens held by staking contract
    console.log('📊 Checking JURIS CW20 tokens...');
    try {
      const jurisBalance = await getBalance({
        token: JURIS_TOKEN_CONTRACT,
        owner: JURIS_STAKING_CONTRACT,
        chain: 'terra'
      });
      
      if (jurisBalance > 0) {
        api.add(JURIS_TOKEN_CONTRACT, jurisBalance);
        console.log(`✅ JURIS balance found: ${jurisBalance} (${jurisBalance / 10**6} JURIS with 6 decimals)`);
      } else {
        console.log('ℹ️ No JURIS tokens found in staking contract');
      }
    } catch (error) {
      console.log('❌ JURIS balance query failed:', error.message);
    }
    
    // Log final balances
    const balances = api.getBalances();
    console.log('📊 Final TVL balances:', Object.keys(balances).length > 0 ? balances : 'No balances found');
    
  } catch (error) {
    console.error('🚨 TVL calculation error:', error.message);
  }
}

async function staking(api) {
  // Staking TVL is the same as total TVL for staking-only protocols
  await tvl(api);
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: `${abi.jurisProtocol.description}. TVL tracks ${tokens.JURIS.symbol} (${tokens.JURIS.decimals} decimals), ${tokens.LUNC.symbol}, and ${tokens.USTC.symbol} staked in the staking contract.`,
  start: 1707782400, // February 2024
  
  // Token price mappings using ABI data
  [`terra:${JURIS_TOKEN_CONTRACT}`]: tokens.JURIS.coingeckoId,
  [`terra:${LUNC_DENOM}`]: tokens.LUNC.coingeckoId,  
  [`terra:${USTC_DENOM}`]: tokens.USTC.coingeckoId,
  
  terra: {
    tvl,
    staking
  }
};
