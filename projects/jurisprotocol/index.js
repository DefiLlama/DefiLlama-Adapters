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
    // Native denom log (for developer)
    if (key === 'LUNC')
      console.log(`[Juris] Token ${key}: DefiLlama key = "lunc" | native denom = "uluna"`);
    if (key === 'USTC')
      console.log(`[Juris] Token ${key}: DefiLlama key = "ustc" | native denom = "uusd"`);
    validTokens.push(tokenData.address);
  });
  console.log(`[Juris] Valid tokens passed to sumTokens2: ${validTokens.join(', ')}`);
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
  console.log(`[Juris] ${contractKey}: Fetching ${tokenList.length} tokens from ${owners.length} contracts`);
  await sumTokens2({ api, owners, tokens: tokenList });
  // After balances fetched, print actual native denom match for clarity
  Object.entries(tokens).forEach(([key, tokenData]) => {
    const addr = tokenData.address;
    const balance = api.getBalances()[addr] || 0;
    let denom = addr;
    if (key === 'LUNC') denom = 'uluna';
    if (key === 'USTC') denom = 'uusd';
    const formatted = (balance / Math.pow(10, tokenData.decimals || 6)).toLocaleString('en-US', { maximumFractionDigits: 2 });
    console.log(`[Juris] FINAL BALANCE: ${key} (addressKey="${addr}", native="${denom}") = ${formatted}`);
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
