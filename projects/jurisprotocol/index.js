// index.js - Enhanced with REAL Balance from Cosmos Query (No Hardcoded Numbers)

const { sumTokens } = require('../helper/chain/cosmos');
const abi = require('./abi.json');

const { contracts, tokens } = abi;

// === HELPER FUNCTION: Check if contract(s) exist ===
function contractExists(contract) {
  if (!contract) return false;
  if (typeof contract === 'string') return contract.trim() !== '';
  if (Array.isArray(contract)) return contract.length > 0 && contract.some(c => c.trim() !== '');
  return false;
}

// === HELPER FUNCTION: Get array of contracts ===
function getContractArray(contract) {
  if (!contract) return [];
  if (typeof contract === 'string') return contract.trim() !== '' ? [contract] : [];
  if (Array.isArray(contract)) return contract.filter(c => c && c.trim() !== '');
  return [];
}

// === STAKING POOLS (Users lock JURIS to earn rewards) ===
async function staking(api) {
  console.log('[Juris] ╔════════════════════════════════════════════╗');
  console.log('[Juris] ║        STAKING BALANCE CALCULATION        ║');
  console.log('[Juris] ╚════════════════════════════════════════════╝');
  console.log('[Juris] Staking contracts:', contracts.staking);
  
  if (!contractExists(contracts.staking)) {
    console.log('[Juris] ⚠️ No staking contracts defined - SKIPPING');
    return;
  }

  const stakingContracts = getContractArray(contracts.staking);
  console.log(`[Juris] Found ${stakingContracts.length} staking contract(s)`);
  
  stakingContracts.forEach((contract, index) => {
    console.log(`[Juris]   Staking ${index + 1}: ${contract}`);
  });
  
  console.log('[Juris]\n[Juris] Querying balances from Cosmos blockchain...');
  console.log('[Juris] JURIS token (CW20):', tokens.JURIS.address);
  console.log('[Juris] JURIS decimals:', tokens.JURIS.decimals);
  console.log('[Juris] JURIS CoinGecko ID:', tokens.JURIS.coingeckoId);
  
  try {
    console.log('[Juris]\n[Juris] 🔍 EXECUTING WASM CONTRACT QUERY ON TERRA CLASSIC...');
    console.log('[Juris] Query: { "balance": { "address": "' + stakingContracts[0] + '" } }');
    
    // Query Cosmos/CosmWasm - this fetches REAL data from blockchain
    await sumTokens({
      api,
      owner: stakingContracts,
      tokens: [tokens.JURIS.address]
    });

    console.log('[Juris] ✅ Query complete - received response from blockchain\n');
    
    // Display REAL balances fetched from Cosmos
    if (api.balances) {
      console.log('[Juris] 📊 STAKING BALANCES (Raw from Cosmos):');
      Object.entries(api.balances).forEach(([token, balance]) => {
        console.log(`[Juris]   Token: ${token}`);
        console.log(`[Juris]   Raw Balance: ${balance.toString()} (raw units from blockchain)`);
        
        // Convert to formatted using actual balance
        const decimals = 6;
        const formatted = (parseFloat(balance) / Math.pow(10, decimals)).toLocaleString('en-US', { maximumFractionDigits: 2 });
        console.log(`[Juris]   Formatted: ${formatted} JURIS tokens\n`);
      });
      
      console.log('[Juris] 💰 USD CONVERSION:');
      Object.entries(api.balances).forEach(([token, balance]) => {
        const decimals = 6;
        const formattedBalance = parseFloat(balance) / Math.pow(10, decimals);
        const coingeckoPrice = tokens.JURIS.coingeckoId ? '(fetched from CoinGecko)' : 'N/A';
        console.log(`[Juris]   ${token}:`);
        console.log(`[Juris]     ${formattedBalance.toLocaleString('en-US', { maximumFractionDigits: 2 })} tokens × Price per token ${coingeckoPrice}`);
        console.log(`[Juris]     = USD Value (calculated by DefiLlama)\n`);
      });
    } else {
      console.log('[Juris] ⚠️ No balances returned from query');
    }
    
    console.log('[Juris] ✅ Staking calculation complete\n');
  } catch (error) {
    console.error('[Juris] ❌ Staking error:', error.message);
  }
}

// === LENDING MARKET (Users deposit LUNC/USTC as collateral) ===
async function lending(api) {
  console.log('[Juris] ╔════════════════════════════════════════════╗');
  console.log('[Juris] ║        LENDING BALANCE CALCULATION        ║');
  console.log('[Juris] ╚════════════════════════════════════════════╝');
  console.log('[Juris] Lending contracts:', contracts.lending);
  
  if (!contractExists(contracts.lending)) {
    console.log('[Juris] ⚠️ No lending contracts defined - SKIPPING');
    return;
  }

  const lendingContracts = getContractArray(contracts.lending);
  console.log(`[Juris] Found ${lendingContracts.length} lending contract(s)\n`);
  
  console.log('[Juris] Querying collateral balances from Cosmos blockchain...');
  console.log('[Juris] LUNC (native):', tokens.LUNC.address, `(decimals: ${tokens.LUNC.decimals})`);
  console.log('[Juris] USTC (native):', tokens.USTC.address, `(decimals: ${tokens.USTC.decimals})`);
  
  try {
    console.log('[Juris]\n[Juris] 🔍 EXECUTING BANK QUERY ON TERRA CLASSIC...');
    console.log('[Juris] Querying native coin balances for lending contract...');
    
    // Query Cosmos Bank module for native coins - this fetches REAL data
    await sumTokens({
      api,
      owner: lendingContracts,
      tokens: [tokens.LUNC.address, tokens.USTC.address]
    });

    console.log('[Juris] ✅ Query complete - received response from blockchain\n');
    
    // Display REAL balances from Cosmos
    if (api.balances) {
      console.log('[Juris] 📊 LENDING COLLATERAL BALANCES (Real from Cosmos):');
      Object.entries(api.balances).forEach(([token, balance]) => {
        console.log(`[Juris]   Token: ${token}`);
        console.log(`[Juris]   Raw Balance: ${balance.toString()} (from blockchain)`);
        
        const decimals = 6;
        const formatted = (parseFloat(balance) / Math.pow(10, decimals)).toLocaleString('en-US', { maximumFractionDigits: 2 });
        console.log(`[Juris]   Formatted: ${formatted} coins\n`);
      });
    }
    
    console.log('[Juris] ✅ Lending calculation complete\n');
  } catch (error) {
    console.error('[Juris] ❌ Lending error:', error.message);
  }
}

// === RESERVE (Protocol reserve contract) ===
async function reserve(api) {
  console.log('[Juris] ========== RESERVE CALCULATION ==========');
  console.log('[Juris] Reserve contracts:', contracts.reserve);
  
  if (!contractExists(contracts.reserve)) {
    console.log('[Juris] ⚠️ No reserve contracts defined - SKIPPING');
    return;
  }

  const reserveContracts = getContractArray(contracts.reserve);
  console.log(`[Juris] Found ${reserveContracts.length} reserve contract(s)`);
  console.log('[Juris] Querying reserve balances from blockchain...');
  console.log('[Juris] LUNC:', tokens.LUNC.address);
  console.log('[Juris] USTC:', tokens.USTC.address);
  
  try {
    await sumTokens({
      api,
      owner: reserveContracts,
      tokens: [tokens.LUNC.address, tokens.USTC.address]
    });
    
    if (api.balances) {
      console.log('[Juris] 📊 RESERVE BALANCES (Real from Cosmos):');
      Object.entries(api.balances).forEach(([token, balance]) => {
        const decimals = 6;
        const formatted = (parseFloat(balance) / Math.pow(10, decimals)).toLocaleString('en-US', { maximumFractionDigits: 2 });
        console.log(`[Juris]   ${token}: ${formatted}`);
      });
    }
    
    console.log('[Juris] ✅ Reserve calculation complete');
  } catch (error) {
    console.error('[Juris] ❌ Reserve error:', error.message);
  }
}

// === POOL2 (LP pools with governance token) ===
async function pool2(api) {
  console.log('[Juris] ========== POOL2 CALCULATION ==========');
  console.log('[Juris] Pool2 contracts:', contracts.pool2);
  
  if (!contractExists(contracts.pool2)) {
    console.log('[Juris] ⚠️ No pool2 contracts defined - SKIPPING');
    return;
  }

  const pool2Contracts = getContractArray(contracts.pool2);
  console.log(`[Juris] Found ${pool2Contracts.length} pool2 contract(s)`);
  console.log('[Juris] Querying LP token from blockchain...');
  console.log('[Juris] LP Token:', tokens.JURIS_LP?.address || 'N/A');
  
  try {
    if (tokens.JURIS_LP?.address) {
      await sumTokens({
        api,
        owner: pool2Contracts,
        tokens: [tokens.JURIS_LP.address]
      });
      
      if (api.balances) {
        console.log('[Juris] 📊 POOL2 BALANCES (Real from Cosmos):');
        Object.entries(api.balances).forEach(([token, balance]) => {
          const decimals = 6;
          const formatted = (parseFloat(balance) / Math.pow(10, decimals)).toLocaleString('en-US', { maximumFractionDigits: 2 });
          console.log(`[Juris]   ${token}: ${formatted}`);
        });
      }
      
      console.log('[Juris] ✅ Pool2 calculation complete');
    } else {
      console.log('[Juris] ⚠️ No JURIS_LP token defined - SKIPPING');
    }
  } catch (error) {
    console.error('[Juris] ❌ Pool2 error:', error.message);
  }
}

// === TREASURY (Multiple treasuries - shown separately) ===
async function treasury(api) {
  console.log('[Juris] ========== TREASURY CALCULATION ==========');
  console.log('[Juris] Treasury contracts:', contracts.treasury);
  
  if (!contractExists(contracts.treasury)) {
    console.log('[Juris] ⚠️ No treasury contracts defined - SKIPPING');
    return;
  }

  const treasuryContracts = getContractArray(contracts.treasury);
  console.log(`[Juris] Found ${treasuryContracts.length} treasury contract(s)`);
  console.log('[Juris] Querying treasury balances from blockchain...');
  
  try {
    await sumTokens({
      api,
      owner: treasuryContracts,
      tokens: [
        tokens.LUNC.address,
        tokens.USTC.address,
        tokens.JURIS.address
      ]
    });
    
    if (api.balances) {
      console.log('[Juris] 📊 TREASURY BALANCES (Real from Cosmos):');
      Object.entries(api.balances).forEach(([token, balance]) => {
        const decimals = 6;
        const formatted = (parseFloat(balance) / Math.pow(10, decimals)).toLocaleString('en-US', { maximumFractionDigits: 2 });
        console.log(`[Juris]   ${token}: ${formatted}`);
      });
    }
    
    console.log('[Juris] ✅ Treasury calculation complete');
  } catch (error) {
    console.error('[Juris] ❌ Treasury error:', error.message);
  }
}

// === VESTING (Multiple vesting schedules - shown separately) ===
async function vesting(api) {
  console.log('[Juris] ========== VESTING CALCULATION ==========');
  console.log('[Juris] Vesting contracts:', contracts.vesting);
  
  if (!contractExists(contracts.vesting)) {
    console.log('[Juris] ⚠️ No vesting contracts defined - SKIPPING');
    return;
  }

  const vestingContracts = getContractArray(contracts.vesting);
  console.log(`[Juris] Found ${vestingContracts.length} vesting contract(s)`);
  
  vestingContracts.forEach((contract, index) => {
    console.log(`[Juris]   Vesting ${index + 1}: ${contract}`);
  });
  
  console.log('[Juris] Querying unvested JURIS from blockchain...');
  
  try {
    await sumTokens({
      api,
      owner: vestingContracts,
      tokens: [tokens.JURIS.address]
    });
    
    if (api.balances) {
      console.log('[Juris] 📊 VESTING BALANCES (Real from Cosmos):');
      Object.entries(api.balances).forEach(([token, balance]) => {
        const decimals = 6;
        const formatted = (parseFloat(balance) / Math.pow(10, decimals)).toLocaleString('en-US', { maximumFractionDigits: 2 });
        console.log(`[Juris]   ${token}: ${formatted}`);
      });
    }
    
    console.log('[Juris] ✅ Vesting calculation complete');
  } catch (error) {
    console.error('[Juris] ❌ Vesting error:', error.message);
  }
}

// === TOTAL TVL (Sum of all user-deposited components) ===
async function tvl(api) {
  console.log('[Juris] ╔════════════════════════════════════════════╗');
  console.log('[Juris] ║  💵 TOTAL TVL CALCULATION (Real Data) 💵  ║');
  console.log('[Juris] ╚════════════════════════════════════════════╝');
  console.log('[Juris]\n[Juris] Fetching REAL balances from Terra Classic blockchain...');
  console.log('[Juris] TVL = Sum of all real balances from contracts\n');
  
  // Call all TVL components - API accumulates REAL balances from Cosmos
  if (contractExists(contracts.staking)) {
    await staking(api);
  }
  
  if (contractExists(contracts.lending)) {
    await lending(api);
  }
  
  if (contractExists(contracts.reserve)) {
    await reserve(api);
  }
  
  if (contractExists(contracts.pool2)) {
    await pool2(api);
  }

  console.log('[Juris] ╔════════════════════════════════════════════╗');
  console.log('[Juris] ║    FINAL TVL (Real Data from Cosmos)     ║');
  console.log('[Juris] ╚════════════════════════════════════════════╝\n');
  
  console.log('[Juris] 📊 ALL ACCUMULATED BALANCES (Real from Cosmos):');
  if (api.balances && Object.keys(api.balances).length > 0) {
    Object.entries(api.balances).forEach(([token, balance]) => {
      const decimals = 6;
      const formattedBalance = parseFloat(balance) / Math.pow(10, decimals);
      const formatted = formattedBalance.toLocaleString('en-US', { maximumFractionDigits: 2 });
      console.log(`[Juris]   ${token}: ${formatted} tokens`);
    });
  } else {
    console.log('[Juris] ℹ️ No balances found - check if contracts are empty or configured');
  }
  
}

// === BUILD EXPORT OBJECT DYNAMICALLY ===
const terraExport = {};

if (contractExists(contracts.staking) || contractExists(contracts.lending) || contractExists(contracts.reserve) || contractExists(contracts.pool2)) {
  terraExport.tvl = tvl;
}

if (contractExists(contracts.staking)) {
  terraExport.staking = staking;
}

if (contractExists(contracts.lending)) {
  terraExport.lending = lending;
}

if (contractExists(contracts.reserve)) {
  terraExport.reserve = reserve;
}

if (contractExists(contracts.pool2)) {
  terraExport.pool2 = pool2;
}

if (contractExists(contracts.treasury)) {
  terraExport.treasury = treasury;
}

if (contractExists(contracts.vesting)) {
  terraExport.vesting = vesting;
}

// === MODULE EXPORT ===
module.exports = {
  methodology: `${abi.protocol.description}. TVL = Real-time sum of ${
    contractExists(contracts.staking) ? 'staking(JURIS) + ' : ''
  }${
    contractExists(contracts.lending) ? 'lending(LUNC/USTC collateral) + ' : ''
  }${
    contractExists(contracts.reserve) ? 'reserve(LUNC/USTC) + ' : ''
  }${
    contractExists(contracts.pool2) ? 'pool2(LP tokens)' : ''
  } queried from Cosmos blockchain. All balances fetched directly from smart contracts, converted to USD using CoinGecko prices.`,
  timetravel: false,
  misrepresentedTokens: false,
  doublecounted: false,
  start: 1707782400,
  terra: terraExport
};
