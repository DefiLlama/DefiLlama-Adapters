// index.js - Full Juris Protocol Adapter with Conditional Exports & Multiple Contracts Support

const { sumTokens } = require('../helper/chain/cosmos');
const abi = require('./abi.json');

const { contracts, tokens } = abi;

// === HELPER FUNCTION: Check if contract(s) exist ===
// Handles both single string and array of contracts
function contractExists(contract) {
  if (!contract) return false;
  if (typeof contract === 'string') return contract.trim() !== '';
  if (Array.isArray(contract)) return contract.length > 0 && contract.some(c => c.trim() !== '');
  return false;
}

// === HELPER FUNCTION: Get array of contracts ===
// Converts single string or array to always return array
function getContractArray(contract) {
  if (!contract) return [];
  if (typeof contract === 'string') return contract.trim() !== '' ? [contract] : [];
  if (Array.isArray(contract)) return contract.filter(c => c && c.trim() !== '');
  return [];
}

// === STAKING POOLS (Users lock JURIS to earn rewards) ===
async function staking(api) {
  console.log('[Juris] ========== STAKING CALCULATION ==========');
  console.log('[Juris] Staking contracts:', contracts.staking);
  
  if (!contractExists(contracts.staking)) {
    console.log('[Juris] ⚠️ No staking contracts defined - SKIPPING');
    return;
  }

  const stakingContracts = getContractArray(contracts.staking);
  console.log(`[Juris] Found ${stakingContracts.length} staking contract(s)`);
  console.log('[Juris] Querying JURIS token:', tokens.JURIS.address);
  
  try {
    await sumTokens({
      api,
      owner: stakingContracts,
      tokens: [tokens.JURIS.address]
    });
    console.log('[Juris] ✅ Staking calculation complete');
  } catch (error) {
    console.error('[Juris] ❌ Staking error:', error.message);
  }
}

// === LENDING MARKET (Users deposit LUNC/USTC as collateral) ===
async function lending(api) {
  console.log('[Juris] ========== LENDING CALCULATION ==========');
  console.log('[Juris] Lending contracts:', contracts.lending);
  
  if (!contractExists(contracts.lending)) {
    console.log('[Juris] ⚠️ No lending contracts defined - SKIPPING');
    return;
  }

  const lendingContracts = getContractArray(contracts.lending);
  console.log(`[Juris] Found ${lendingContracts.length} lending contract(s)`);
  console.log('[Juris] Querying collateral tokens...');
  console.log('[Juris] LUNC:', tokens.LUNC.address);
  console.log('[Juris] USTC:', tokens.USTC.address);
  
  try {
    await sumTokens({
      api,
      owner: lendingContracts,
      tokens: [tokens.LUNC.address, tokens.USTC.address]
    });
    console.log('[Juris] ✅ Lending calculation complete');
  } catch (error) {
    console.error('[Juris] ❌ Lending error:', error.message);
  }
}

// === RESERVE (Protocol reserve contracts) ===
async function reserve(api) {
  console.log('[Juris] ========== RESERVE CALCULATION ==========');
  console.log('[Juris] Reserve contracts:', contracts.reserve);
  
  if (!contractExists(contracts.reserve)) {
    console.log('[Juris] ⚠️ No reserve contracts defined - SKIPPING');
    return;
  }

  const reserveContracts = getContractArray(contracts.reserve);
  console.log(`[Juris] Found ${reserveContracts.length} reserve contract(s)`);
  console.log('[Juris] Querying reserve tokens...');
  console.log('[Juris] LUNC:', tokens.LUNC.address);
  console.log('[Juris] USTC:', tokens.USTC.address);
  
  try {
    await sumTokens({
      api,
      owner: reserveContracts,
      tokens: [tokens.LUNC.address, tokens.USTC.address]
    });
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
  console.log('[Juris] Querying LP token:', tokens.JURIS_LP?.address || 'N/A');
  
  try {
    if (tokens.JURIS_LP?.address) {
      await sumTokens({
        api,
        owner: pool2Contracts,
        tokens: [tokens.JURIS_LP.address]
      });
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
  console.log('[Juris] Querying treasury tokens...');
  console.log('[Juris] LUNC:', tokens.LUNC.address);
  console.log('[Juris] USTC:', tokens.USTC.address);
  console.log('[Juris] JURIS:', tokens.JURIS.address);
  
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
    console.log('[Juris] ✅ Treasury calculation complete');
  } catch (error) {
    console.error('[Juris] ❌ Treasury error:', error.message);
  }
}

// === VESTING (Multiple vesting schedules - shown separately) ===
// THIS HANDLES BOTH SINGLE AND MULTIPLE VESTING CONTRACTS
async function vesting(api) {
  console.log('[Juris] ========== VESTING CALCULATION ==========');
  console.log('[Juris] Vesting contracts:', contracts.vesting);
  
  if (!contractExists(contracts.vesting)) {
    console.log('[Juris] ⚠️ No vesting contracts defined - SKIPPING');
    return;
  }

  const vestingContracts = getContractArray(contracts.vesting);
  console.log(`[Juris] Found ${vestingContracts.length} vesting contract(s)`);
  
  // Log each vesting contract separately for visibility
  vestingContracts.forEach((contract, index) => {
    console.log(`[Juris]   Vesting ${index + 1}: ${contract}`);
  });
  
  console.log('[Juris] Querying unvested JURIS:', tokens.JURIS.address);
  
  try {
    await sumTokens({
      api,
      owner: vestingContracts,
      tokens: [tokens.JURIS.address]
    });
    console.log('[Juris] ✅ Vesting calculation complete');
  } catch (error) {
    console.error('[Juris] ❌ Vesting error:', error.message);
  }
}

// === TOTAL TVL (Sum of all user-deposited components) ===
async function tvl(api) {
  console.log('[Juris] ╔════════════════════════════════════════════╗');
  console.log('[Juris] ║           TOTAL TVL CALCULATION           ║');
  console.log('[Juris] ╚════════════════════════════════════════════╝');
  
  // Call all TVL components - API accumulates balances
  // (NOT treasury, NOT vesting - those are separate)
  
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

  console.log('[Juris] ✅ TOTAL TVL calculation complete\n');
}

// === BUILD EXPORT OBJECT DYNAMICALLY ===
// Only include functions where contract is defined
const terraExport = {};

// Always include tvl if any component exists
if (contractExists(contracts.staking) || contractExists(contracts.lending) || contractExists(contracts.reserve) || contractExists(contracts.pool2)) {
  terraExport.tvl = tvl;
}

// Add individual components only if contracts exist
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
  methodology: `${abi.protocol.description}. TVL = ${
    contractExists(contracts.staking) ? 'staking(JURIS) + ' : ''
  }${
    contractExists(contracts.lending) ? 'lending(LUNC/USTC collateral) + ' : ''
  }${
    contractExists(contracts.reserve) ? 'reserve(LUNC/USTC) + ' : ''
  }${
    contractExists(contracts.pool2) ? 'pool2(LP tokens)' : ''
  }${
    (contractExists(contracts.staking) || contractExists(contracts.lending) || contractExists(contracts.reserve) || contractExists(contracts.pool2)) && 
    (contractExists(contracts.treasury) || contractExists(contracts.vesting))
      ? '. Treasury and vesting tracked separately.'
      : '.'
  }`,
  timetravel: false,
  misrepresentedTokens: false,
  doublecounted: false,
  start: 1707782400,
  terra: terraExport
};
