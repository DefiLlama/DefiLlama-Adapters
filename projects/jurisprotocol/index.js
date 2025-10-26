const { sumTokens2 } = require('../helper/unwrapLPs');
const abi = require('./abi.json');

const { contracts, tokens } = abi;

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
function getValidTokens() {
  const validTokens = [];
  Object.entries(tokens).forEach(([key, tokenData]) => {
    if (!tokenData || !tokenData.address || tokenData.address.trim() === '') {
      console.warn(`[Juris] WARNING: Token ${key} has invalid/missing address - skipping`);
      return;
    }
    // Log mapping for understanding (only!)
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
      console.log(`[Juris] Token ${key}: CW20 token address = "${llamaKey}"`);
    } else {
      console.log(`[Juris] Token ${key}: DefiLlama key = "${llamaKey}" | native denom = "${nativeDenom}"`);
    }
    validTokens.push(llamaKey);
  });
  console.log(`[Juris] ✅ Valid tokens passed to sumTokens2: ${validTokens.join(', ')}`);
  return validTokens;
}

// Single unified function for all categories
async function fetchBalances(api, contractKey) {
  if (!contractExists(contracts[contractKey])) return;
  const owners = getContractArray(contracts[contractKey]);
  if (owners.length === 0) {
    console.log(`[Juris] ${contractKey}: No valid contract addresses`);
    return;
  }
  const tokenList = getValidTokens();
  if (tokenList.length === 0) {
    console.log(`[Juris] ${contractKey}: No valid tokens configured`);
    return;
  }

  // Log summary of all addresses and tokens being queried
  console.log(`[Juris] ${contractKey}: Passing to sumTokens2`);
  console.log(`  Contracts:`);
  owners.forEach(c => console.log(`    ${c}`));
  console.log(`  Tokens:`);
  tokenList.forEach(t => console.log(`    ${t}`));

  try {
    await sumTokens2({
      api,
      owners,
      tokens: tokenList,
    });
    // LOG returned balances
    const balances = api.getBalances();
    Object.entries(tokens).forEach(([key, tokenData]) => {
      const addr = key === 'LUNC'
        ? 'lunc'
        : key === 'USTC'
        ? 'ustc'
        : tokenData.address;
      const val = balances[addr];
      const pretty = val ? (val / Math.pow(10, tokenData.decimals || 6)).toLocaleString('en-US', { maximumFractionDigits: 2 }) : '0';
      console.log(`[Juris] [${contractKey}] Final ${key} balance for addressKey "${addr}" = ${pretty}`);
    });
    console.log(`[Juris] ${contractKey}: Success`);
  } catch (error) {
    console.error(`[Juris] ${contractKey}: Error - ${error.message}`);
    throw error;
  }
}


async function tvl(api) {
  console.log('[Juris] TVL: Starting...');
  
  await Promise.all([
    fetchBalances(api, 'staking'),
    fetchBalances(api, 'lending'),
    fetchBalances(api, 'reserve'),
  ]);

  console.log('[Juris] TVL: Complete');
  return api.getBalances();
}

async function staking(api) {
  return fetchBalances(api, 'staking');
}

async function lending(api) {
  return fetchBalances(api, 'lending');
}

async function reserve(api) {
  return fetchBalances(api, 'reserve');
}

// Dynamic exports based on ABI configuration
const terraExport = {};
if (contractExists(contracts.staking)) terraExport.staking = staking;
if (contractExists(contracts.lending)) terraExport.lending = lending;
if (contractExists(contracts.reserve)) terraExport.reserve = reserve;

if (Object.keys(terraExport).length > 0) {
  terraExport.tvl = tvl;
}

module.exports = {
  methodology: `${abi.protocol.description}. TVL is the sum of JURIS (CW20), LUNC, and USTC (native) balances across staking, lending, and reserve contracts.`,
  timetravel: false,
  terra: terraExport,
};
