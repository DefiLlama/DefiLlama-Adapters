// index.js - With Fallback Query & Safe Balance Checking

const { sumTokens, queryContract } = require('../helper/chain/cosmos');
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

// === SAFE BALANCE QUERY: Try sumTokens, fallback to queryContract ===
async function getSafeBalance(api, owner, tokenAddress, chain = 'terra') {
  try {
    // First try: sumTokens (standard approach)
    console.log(`[Juris] Querying ${tokenAddress}...`);
    
    await sumTokens({
      api,
      owner: [owner],
      tokens: [tokenAddress]
    });

    // Check if balance was captured
    if (api.balances && Object.keys(api.balances).length > 0) {
      console.log(`[Juris] ✅ Found balance via sumTokens`);
      return true;
    }

    console.log(`[Juris] No balance via sumTokens, trying queryContract...`);
    
    // Fallback: Direct queryContract for CW20 tokens
    if (tokenAddress.startsWith('terra1')) {
      try {
        const result = await queryContract({
          chain: chain,
          contract: tokenAddress,
          msg: { balance: { address: owner } }
        });

        if (result && result.balance && result.balance > 0) {
          console.log(`[Juris] ✅ Found balance via queryContract: ${result.balance}`);
          api.add(tokenAddress, result.balance);
          return true;
        } else {
          console.log(`[Juris] No balance found (contract returned 0 or null)`);
          return false;
        }
      } catch (queryError) {
        console.log(`[Juris] queryContract failed: ${queryError.message}`);
        return false;
      }
    }

    return false;
  } catch (error) {
    console.error(`[Juris] Balance query error: ${error.message}`);
    
    // Try fallback for CW20
    if (tokenAddress.startsWith('terra1')) {
      try {
        console.log(`[Juris] Attempting queryContract fallback...`);
        const result = await queryContract({
          chain: 'terra',
          contract: tokenAddress,
          msg: { balance: { address: owner } }
        });

        if (result && result.balance && result.balance > 0) {
          console.log(`[Juris] ✅ Fallback succeeded: ${result.balance}`);
          api.add(tokenAddress, result.balance);
          return true;
        }
      } catch (fallbackError) {
        console.error(`[Juris] Fallback also failed: ${fallbackError.message}`);
      }
    }

    return false;
  }
}

// === STAKING ===
async function staking(api) {
  console.log('[Juris] Staking: Querying...');
  
  if (!contractExists(contracts.staking)) {
    console.log('[Juris] Staking: SKIPPED (empty)');
    return;
  }

  const stakingContracts = getContractArray(contracts.staking);
  
  try {
    // Try to get JURIS balance
    const hasJuris = await getSafeBalance(api, stakingContracts[0], tokens.JURIS.address);
    
    if (!hasJuris) {
      console.log('[Juris] Checking LUNC and USTC fallback...');
      // If no JURIS, check native coins
      await sumTokens({
        api,
        owner: stakingContracts,
        tokens: [tokens.LUNC.address, tokens.USTC.address]
      });
    }
    
    console.log('[Juris] Staking: ✅ Complete');
  } catch (error) {
    console.error('[Juris] Staking: ❌', error.message);
  }
}

// === LENDING ===
async function lending(api) {
  console.log('[Juris] Lending: Querying...');
  
  if (!contractExists(contracts.lending)) {
    console.log('[Juris] Lending: SKIPPED (empty)');
    return;
  }

  const lendingContracts = getContractArray(contracts.lending);
  
  try {
    // Query LUNC and USTC
    await sumTokens({
      api,
      owner: lendingContracts,
      tokens: [tokens.LUNC.address, tokens.USTC.address]
    });

    // Also try JURIS as fallback
    const hasJuris = await getSafeBalance(api, lendingContracts[0], tokens.JURIS.address);
    
    console.log('[Juris] Lending: ✅ Complete');
  } catch (error) {
    console.error('[Juris] Lending: ❌', error.message);
  }
}

// === RESERVE ===
async function reserve(api) {
  console.log('[Juris] Reserve: Querying...');
  
  if (!contractExists(contracts.reserve)) {
    console.log('[Juris] Reserve: SKIPPED (empty)');
    return;
  }

  const reserveContracts = getContractArray(contracts.reserve);
  
  try {
    await sumTokens({
      api,
      owner: reserveContracts,
      tokens: [tokens.LUNC.address, tokens.USTC.address, tokens.JURIS.address]
    });
    console.log('[Juris] Reserve: ✅ Complete');
  } catch (error) {
    console.error('[Juris] Reserve: ❌', error.message);
  }
}

// === POOL2 ===
async function pool2(api) {
  console.log('[Juris] Pool2: Querying...');
  
  if (!contractExists(contracts.pool2)) {
    console.log('[Juris] Pool2: SKIPPED (empty)');
    return;
  }

  const pool2Contracts = getContractArray(contracts.pool2);
  
  try {
    if (tokens.JURIS_LP?.address) {
      await sumTokens({
        api,
        owner: pool2Contracts,
        tokens: [tokens.JURIS_LP.address]
      });
    }
    console.log('[Juris] Pool2: ✅ Complete');
  } catch (error) {
    console.error('[Juris] Pool2: ❌', error.message);
  }
}

// === TREASURY ===
async function treasury(api) {
  console.log('[Juris] Treasury: Querying...');
  
  if (!contractExists(contracts.treasury)) {
    console.log('[Juris] Treasury: SKIPPED (empty)');
    return;
  }

  const treasuryContracts = getContractArray(contracts.treasury);
  
  try {
    await sumTokens({
      api,
      owner: treasuryContracts,
      tokens: [tokens.LUNC.address, tokens.USTC.address, tokens.JURIS.address]
    });
    console.log('[Juris] Treasury: ✅ Complete');
  } catch (error) {
    console.error('[Juris] Treasury: ❌', error.message);
  }
}

// === VESTING ===
async function vesting(api) {
  console.log('[Juris] Vesting: Querying...');
  
  if (!contractExists(contracts.vesting)) {
    console.log('[Juris] Vesting: SKIPPED (empty)');
    return;
  }

  const vestingContracts = getContractArray(contracts.vesting);
  
  try {
    await sumTokens({
      api,
      owner: vestingContracts,
      tokens: [tokens.JURIS.address]
    });
    console.log('[Juris] Vesting: ✅ Complete');
  } catch (error) {
    console.error('[Juris] Vesting: ❌', error.message);
  }
}

// === TOTAL TVL ===
async function tvl(api) {
  console.log('[Juris] TVL: Calculating...');
  
  if (contractExists(contracts.staking)) await staking(api);
  if (contractExists(contracts.lending)) await lending(api);
  if (contractExists(contracts.reserve)) await reserve(api);
  if (contractExists(contracts.pool2)) await pool2(api);

  console.log('[Juris] TVL: ✅ Complete\n');
}

// === BUILD EXPORT OBJECT ===
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
  methodology: `${abi.protocol.description}. TVL = ${
    contractExists(contracts.staking) ? 'staking + ' : ''
  }${
    contractExists(contracts.lending) ? 'lending + ' : ''
  }${
    contractExists(contracts.reserve) ? 'reserve + ' : ''
  }${
    contractExists(contracts.pool2) ? 'pool2' : ''
  }.`,
  timetravel: false,
  misrepresentedTokens: false,
  doublecounted: false,
  start: 1707782400,
  terra: terraExport
};
