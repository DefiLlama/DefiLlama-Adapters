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

// Single unified function for all categories
async function fetchBalances(api, contractKey) {
  if (!contractExists(contracts[contractKey])) {
    return;
  }

  const owners = getContractArray(contracts[contractKey]);
  const tokens_list = [
    tokens.JURIS.address,   // CW20
    tokens.LUNC.address,    // Native
    tokens.USTC.address,    // Native
  ];

  console.log(`[Juris] ${contractKey}: Fetching ${tokens_list.length} tokens from ${owners.length} contracts`);

  await sumTokens2({
    api,
    owners,
    tokens: tokens_list,
  });
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
