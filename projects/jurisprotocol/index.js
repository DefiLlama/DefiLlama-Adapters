const { sumTokens, queryContract, queryContractWithRetries } = require('../helper/chain/cosmos');
const abi = require('./abi.json');
const { contracts, tokens } = abi;

// Helper for valid contract address array
function isNonEmptyAddress(addr) {
  return typeof addr === 'string' && addr.trim() !== '';
}

// Get all tokens to scan for each contract category, filtering by type
function getTokenList() {
  return Object.entries(tokens)
    .map(([key, info]) => ({ key, ...info }))
    .filter(token => isNonEmptyAddress(token.address) && (token.type === 'cw20' || token.type === 'native'));
}

// Main per-token balance query: logs and tries all methods!
async function fetchTokenBalance(api, owner, token) {
  const { key, address, type, decimals = 6 } = token;
  // Map native tokens for DefiLlama sumTokens
  let sumTokensKey = address;
  if (type === 'native') {
    if (address === 'uluna') sumTokensKey = 'lunc';
    if (address === 'uusd') sumTokensKey = 'ustc';
    console.log(`[Juris] Token ${key}: DefiLlama key = "${sumTokensKey}" | native denom = "${address}"`);
  } else {
    console.log(`[Juris] Token ${key}: CW20 address = "${address}"`);
  }
  console.log(`[Juris] Querying contract ${owner} for token ${key} (${sumTokensKey})`);
  // Try DefiLlama sumTokens helper
  await sumTokens({ api, owner: [owner], tokens: [sumTokensKey] });
  let bal = api.getBalances()[sumTokensKey] || 0;
  if (bal > 0) {
    console.log(`[Juris]   ✓ sumTokens: ${bal / Math.pow(10, decimals)} ${key}`);
    return bal;
  }
  // Fallback for CW20
  if (type === 'cw20') {
    try {
      const resp = await queryContract({
        contract: address,
        chain: 'terra',
        msg: { balance: { address: owner } },
      });
      if (resp && resp.balance) {
        api.add(sumTokensKey, resp.balance);
        console.log(`[Juris]   ✓ queryContract (CW20): ${resp.balance / Math.pow(10, decimals)} ${key}`);
        return resp.balance;
      }
    } catch (e) {
      console.log(`[Juris]   ⚠ queryContract error: ${e.message}`);
    }
  }
  // Fallback for native
  if (type === 'native') {
    try {
      const resp = await queryContractWithRetries({
        chain: 'terra',
        denom: address,
        address: owner,
      });
      if (resp && resp.amount) {
        api.add(sumTokensKey, resp.amount);
        console.log(`[Juris]   ✓ queryContractWithRetries (native): ${resp.amount / Math.pow(10, decimals)} ${key}`);
        return resp.amount;
      }
    } catch (e) {
      console.log(`[Juris]   ⚠ queryContractWithRetries error: ${e.message}`);
    }
  }
  console.log(`[Juris]   No balance found for ${key} (${owner})`);
  return 0;
}

// Main per-category contract group balance
async function fetchBalances(api, contractKey) {
  const owners = (contracts[contractKey] || []).filter(isNonEmptyAddress);
  if (!owners.length) {
    console.log(`[Juris] No contracts configured for "${contractKey}"`);
    return;
  }
  const tokenList = getTokenList();
  console.log(`[Juris] ${contractKey}: Querying ${tokenList.length} tokens for ${owners.length} contracts.`);
  owners.forEach(owner => console.log(`[Juris] ${contractKey} address: ${owner}`));
  for (const owner of owners) {
    for (const token of tokenList) {
      await fetchTokenBalance(api, owner, token);
    }
  }
  // Final balances log
  const balances = api.getBalances();
  tokenList.forEach(({ key, decimals, address, type }) => {
    let lookup = (type === 'native')
      ? (address === 'uluna' ? 'lunc' : address === 'uusd' ? 'ustc' : address)
      : address;
    const bal = balances[lookup] || 0;
    const pretty = (bal / Math.pow(10, decimals)).toLocaleString('en-US', { maximumFractionDigits: 4 });
    console.log(`[Juris] [${contractKey}] Final balance ${key} ("${lookup}"): ${pretty}`);
  });
}

// Dynamically export adapter methods for every non-empty contract category
const terraExport = {};
Object.keys(contracts).forEach(contractKey => {
  const addrs = contracts[contractKey] || [];
  if (Array.isArray(addrs) ? addrs.some(isNonEmptyAddress) : isNonEmptyAddress(addrs)) {
    terraExport[contractKey] = async (api) => fetchBalances(api, contractKey);
  }
});

// TVL sums all categories, always present
if (Object.keys(terraExport).length > 0) {
  terraExport.tvl = async (api) => {
    const tasks = Object.keys(terraExport)
      .filter(key => key !== 'tvl')
      .map(key => terraExport[key](api));
    await Promise.all(tasks);
    // Log global TVL amounts
    const balances = api.getBalances();
    getTokenList().forEach(({ key, decimals, address, type }) => {
      let lookup = (type === 'native')
        ? (address === 'uluna' ? 'lunc' : address === 'uusd' ? 'ustc' : address)
        : address;
      const bal = balances[lookup] || 0;
      const pretty = (bal / Math.pow(10, decimals)).toLocaleString('en-US', { maximumFractionDigits: 4 });
      console.log(`[Juris] [TVL] Global balance ${key} ("${lookup}"): ${pretty}`);
    });
    return balances;
  };
}

module.exports = {
  methodology: `${abi.protocol.description}. Fully dynamic modular TVL: every valid contract category and coin/token, robust fallback querying and transparent logging.`,
  timetravel: false,
  terra: terraExport,
};
