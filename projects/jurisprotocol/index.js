const { sumTokens, queryContract, queryContracts, queryContractWithRetries } = require('../helper/chain/cosmos');
const abi = require('./abi.json');

const { contracts, tokens } = abi;

// === Helper: Check if field is a non-empty string or array ===
function contractExists(contract) {
  if (!contract) return false;
  if (typeof contract === 'string') return contract.trim() !== '';
  if (Array.isArray(contract)) return contract.length > 0 && contract.some(c => c && c.trim() !== '');
  return false;
}

function getContractArray(contract) {
  if (!contract) return [];
  if (typeof contract === 'string') return contract.trim() !== '' ? [contract] : [];
  if (Array.isArray(contract)) return contract.filter(c => c && c.trim() !== '');
  return [];
}

// === Map tokens for DefiLlama and log full mapping ===
function getValidTokens() {
  const validTokens = [];
  Object.entries(tokens).forEach(([key, tokenData]) => {
    if (!tokenData || !tokenData.address || tokenData.address.trim() === '') {
      console.warn(`[Juris] WARNING: Token ${key} has invalid/missing address - skipping`);
      return;
    }
    let llamaKey = tokenData.address;
    let nativeDenom = '';
    if (key === 'LUNC') {
      llamaKey = 'lunc';
      nativeDenom = 'uluna';
    }
    if (key === 'USTC') {
      llamaKey = 'ustc';
      nativeDenom = 'uusd';
    }
    if (llamaKey.startsWith('terra1') || llamaKey.startsWith('terra2')) {
      console.log(`[Juris] Token ${key}: CW20 address = "${llamaKey}"`);
    } else {
      console.log(`[Juris] Token ${key}: DefiLlama key = "${llamaKey}" | native denom = "${nativeDenom}"`);
    }
    validTokens.push({ key, llamaKey, decimals: tokenData.decimals || 6 });
  });
  console.log(`[Juris] VALID tokens for scan: ${validTokens.map(t => t.llamaKey).join(', ')}`);
  return validTokens;
}

// === Query and log balances, per contract and per token ===
async function fetchTokenBalance(api, owner, tokenObj) {
  const { key, llamaKey, decimals } = tokenObj;
  // Use DefiLlama-compatible key for balance lookups
  await sumTokens({ api, owner: [owner], tokens: [llamaKey] });
  const bal = api.getBalances()[llamaKey] || 0;
  if (bal > 0) {
    console.log(`[Juris]   ✓ sumTokens for ${key} (${llamaKey}) on ${owner} = ${bal / Math.pow(10, decimals)} ${key}`);
    return bal;
  }
  // Fallback: if a CW20, try direct smart contract query
  if (llamaKey.startsWith('terra1')) {
    try {
      const res = await queryContract({
        contract: llamaKey,
        chain: 'terra',
        msg: { balance: { address: owner } },
      });
      if (res && res.balance && res.balance > 0) {
        api.add(llamaKey, res.balance);
        console.log(`[Juris]   ✓ queryContract (CW20) for ${key} (${llamaKey}) on ${owner} = ${res.balance / Math.pow(10, decimals)} ${key}`);
        return res.balance;
      }
    } catch (e) {
      console.log(`[Juris]   queryContract error for ${key}: ${e.message}`);
    }
  }
  // Fallback: for native tokens (shouldn't be needed if keys are correct)
  if (key === 'LUNC' || key === 'USTC') {
    try {
      const nativeDenom = key === 'LUNC' ? 'uluna' : 'uusd';
      const res = await queryContractWithRetries({
        chain: 'terra',
        denom: nativeDenom,
        address: owner,
      });
      if (res && res.amount && res.amount > 0) {
        api.add(llamaKey, res.amount);
        console.log(`[Juris]   ✓ queryContractWithRetries (native) for ${key} (${nativeDenom}) on ${owner} = ${res.amount / Math.pow(10, decimals)} ${key}`);
        return res.amount;
      }
    } catch (e) {
      console.log(`[Juris]   queryContractWithRetries error for ${key}: ${e.message}`);
    }
  }
  console.log(`[Juris]   No balance found for ${key} (${llamaKey}) on ${owner}`);
  return 0;
}

async function fetchBalances(api, contractKey) {
  if (!contractExists(contracts[contractKey])) return;
  const owners = getContractArray(contracts[contractKey]);
  if (owners.length === 0) {
    console.log(`[Juris] ${contractKey}: No valid contract addresses`);
    return;
  }
  const tokenObjs = getValidTokens();
  if (tokenObjs.length === 0) {
    console.log(`[Juris] ${contractKey}: No valid tokens to process`);
    return;
  }

  // Log contracts and tokens being queried
  console.log(`[Juris] ${contractKey}: Contracts to scan:`, owners);
  console.log(`[Juris] ${contractKey}: Tokens to scan:`, tokenObjs.map(t => t.key).join(', '));

  for (const owner of owners) {
    for (const tokenObj of tokenObjs) {
      await fetchTokenBalance(api, owner, tokenObj);
    }
  }

  // Print summary per token
  const balances = api.getBalances();
  tokenObjs.forEach(({ key, llamaKey, decimals }) => {
    const balance = balances[llamaKey] || 0;
    const pretty = (balance / Math.pow(10, decimals)).toLocaleString('en-US', { maximumFractionDigits: 4 });
    console.log(`[Juris] [${contractKey}] Final balance ${key} ("${llamaKey}"): ${pretty}`);
  });
}

// === Individual module functions ===
async function staking(api) { await fetchBalances(api, 'staking'); }
async function lending(api) { await fetchBalances(api, 'lending'); }
async function reserve(api) { await fetchBalances(api, 'reserve'); }

// === Main TVL aggregator ===
async function tvl(api) {
  console.log('[Juris] TVL start...');
  const tasks = [];
  if (contractExists(contracts.staking)) tasks.push(staking(api));
  if (contractExists(contracts.lending)) tasks.push(lending(api));
  if (contractExists(contracts.reserve)) tasks.push(reserve(api));

  if (tasks.length === 0) {
    console.log('[Juris] TVL: No contracts configured');
    return api.getBalances();
  }
  await Promise.all(tasks);
  console.log('[Juris] TVL complete.');
  return api.getBalances();
}

// === Dynamic module exports ===
const terraExport = {};
if (contractExists(contracts.staking)) terraExport.staking = staking;
if (contractExists(contracts.lending)) terraExport.lending = lending;
if (contractExists(contracts.reserve)) terraExport.reserve = reserve;
if (Object.keys(terraExport).length > 0) terraExport.tvl = tvl;

module.exports = {
  methodology: `${abi.protocol.description}. TVL is balances for JURIS (CW20), LUNC and USTC (native) across all configured contracts.`,
  timetravel: false,
  terra: terraExport,
};
