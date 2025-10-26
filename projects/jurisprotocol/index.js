// index.js - Robust TVL adapter with safe fallback balance checks for CW20 and native coins

const { sumTokens, queryContract, getBalance } = require('../helper/chain/cosmos');
const abi = require('./abi.json');

const { contracts, tokens } = abi;

// === Helper: Check if field is a non-empty string or array ===
function contractExists(contract) {
  if (!contract) return false;
  if (typeof contract === 'string') return contract.trim() !== '';
  if (Array.isArray(contract)) return contract.length > 0 && contract.some(c => c.trim() !== '');
  return false;
}
function getContractArray(contract) {
  if (!contract) return [];
  if (typeof contract === 'string') return contract.trim() !== '' ? [contract] : [];
  if (Array.isArray(contract)) return contract.filter(c => c && c.trim() !== '');
  return [];
}

// === Safe universal balance fetch: multi-method with fallback ===
async function fetchTokenBalance(api, owner, tokenAddr) {
  console.log(`[Juris] ▶️ Checking balance for token: ${tokenAddr} @ ${owner}`);
  // 1. Try sumTokens first
  await sumTokens({ api, owner: [owner], tokens: [tokenAddr] });
  const balSum = api.balances && api.balances[tokenAddr] ? api.balances[tokenAddr] : 0;
  if (balSum > 0) {
    console.log(`[Juris]   ✓ sumTokens succeeded for ${tokenAddr}: ${balSum}`);
    return;
  } else {
    console.log(`[Juris]   sumTokens returned zero or empty.`);
  }
  // 2. Fallback: queryContract (for CW20)
  if (tokenAddr.startsWith('terra1')) {
    try {
      const r = await queryContract({
        chain: 'terra',
        contract: tokenAddr,
        msg: { balance: { address: owner } }
      });
      if (r && r.balance && r.balance > 0) {
        api.add(tokenAddr, r.balance);
        console.log(`[Juris]   ✓ queryContract succeeded for ${tokenAddr}: ${r.balance}`);
        return;
      } else {
        console.log(`[Juris]   queryContract returned zero or empty.`);
      }
    } catch (e) {
      console.log(`[Juris]   queryContract errored: ${e.message}`);
    }
  }
  // 3. Fallback: getBalance (for native)
  try {
    const b = await getBalance('terra', owner, tokenAddr);
    if (b && b > 0) {
      api.add(tokenAddr, b);
      console.log(`[Juris]   ✓ getBalance succeeded for ${tokenAddr}: ${b}`);
      return;
    } else {
      console.log(`[Juris]   getBalance returned zero or empty.`);
    }
  } catch (e) {
    console.log(`[Juris]   getBalance errored: ${e.message}`);
  }
}


async function staking(api) {
  if (!contractExists(contracts.staking)) return;
  const stakingContracts = getContractArray(contracts.staking);
  for (const owner of stakingContracts) {
    await Promise.all([
      fetchTokenBalance(api, owner, tokens.JURIS.address),
      fetchTokenBalance(api, owner, tokens.LUNC.address),
      fetchTokenBalance(api, owner, tokens.USTC.address),
    ]);
  }

  // Print final detected balances
  ['JURIS', 'LUNC', 'USTC'].forEach((k) => {
    const addr = tokens[k].address;
    const bal = api.balances && api.balances[addr] ? api.balances[addr] : 0;
    const formatted = (bal / 1e6).toLocaleString('en-US', { maximumFractionDigits: 2 });
    console.log(`[Juris] FINAL ${k} balance: ${formatted} ${k}`);
  });
  console.log('[Juris] Staking: Done');
}


// Similar pattern for lending, reserve, pool2, treasury, vesting if you wish:
async function lending(api) {
  if (!contractExists(contracts.lending)) return;
  const lendingContracts = getContractArray(contracts.lending);
  for (const owner of lendingContracts) {
    await Promise.all([
      fetchTokenBalance(api, owner, tokens.LUNC.address),
      fetchTokenBalance(api, owner, tokens.USTC.address),
      fetchTokenBalance(api, owner, tokens.JURIS.address),
    ]);
  }
  console.log('[Juris] Lending: Done');
}
async function reserve(api) {
  if (!contractExists(contracts.reserve)) return;
  const reserveContracts = getContractArray(contracts.reserve);
  for (const owner of reserveContracts) {
    await Promise.all([
      fetchTokenBalance(api, owner, tokens.LUNC.address),
      fetchTokenBalance(api, owner, tokens.USTC.address),
      fetchTokenBalance(api, owner, tokens.JURIS.address),
    ]);
  }
  console.log('[Juris] Reserve: Done');
}

async function tvl(api) {
  if (contractExists(contracts.staking)) await staking(api);
  if (contractExists(contracts.lending)) await lending(api);
  if (contractExists(contracts.reserve)) await reserve(api);
  console.log('[Juris] TVL: Done');
}

const terraExport = {};
if (contractExists(contracts.staking) || contractExists(contracts.lending) || contractExists(contracts.reserve)) terraExport.tvl = tvl;
if (contractExists(contracts.staking)) terraExport.staking = staking;
if (contractExists(contracts.lending)) terraExport.lending = lending;
if (contractExists(contracts.reserve)) terraExport.reserve = reserve;

module.exports = {
  methodology: `${abi.protocol.description}. TVL is sum of balances for JURIS, LUNC and USTC (multi-method fallback).`,
  timetravel: false,
  terra: terraExport,
};
