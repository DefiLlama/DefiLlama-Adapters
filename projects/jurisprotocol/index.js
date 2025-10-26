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
  // Try sumTokens first
  await sumTokens({ api, owner: [owner], tokens: [tokenAddr] });
  if (api.balances && api.balances[tokenAddr] && api.balances[tokenAddr] > 0) {
    console.log(`[Juris] ${tokenAddr}: sumTokens ✓`);
    return;
  }
  // Fallback to queryContract for CW20
  if (tokenAddr.startsWith('terra1')) {
    try {
      const result = await queryContract({
        chain: 'terra',
        contract: tokenAddr,
        msg: { balance: { address: owner } }
      });
      if (result && result.balance && result.balance > 0) {
        api.add(tokenAddr, result.balance);
        console.log(`[Juris] ${tokenAddr}: queryContract ✓`);
        return;
      }
    } catch {}
  }
  // Final fallback to getBalance for native
  try {
    const balance = await getBalance('terra', owner, tokenAddr);
    if (balance && balance > 0) {
      api.add(tokenAddr, balance);
      console.log(`[Juris] ${tokenAddr}: getBalance ✓`);
      return;
    }
  } catch {}
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
