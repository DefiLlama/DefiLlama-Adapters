const axios = require('axios');

let cachedBalances = null;
let fetchPromise = null;

async function fetchBalances() {
  if (cachedBalances) {
    return cachedBalances;
  }
  
  // If a fetch is already in progress, wait for it
  if (fetchPromise) {
    return fetchPromise;
  }
  
  // Start a new fetch and cache the promise
  fetchPromise = axios.get('https://platform.data.defuse.org/api/public/tvl')
    .then(response => {
      const allBalances = response.data.balances;
      
      // Filter out chains with zero TVL
      cachedBalances = {};
      Object.keys(allBalances).forEach(chain => {
        const balance = allBalances[chain];
        if (balance && Object.values(balance).some(amount => amount > 0)) {
          cachedBalances[chain] = balance;
        }
      });
      
      return cachedBalances;
    })
    .finally(() => {
      fetchPromise = null;
    });
  
  return fetchPromise;
}

async function tvl(api) {
  const chainBalances = await fetchBalances();
  const currentChain = api.chain;
  
  if (!chainBalances || !chainBalances[currentChain]) {
    return {};
  }
  
  return chainBalances[currentChain];
}

// Only export the chains that actually have TVL data
// This list was determined by running the adapter and checking which chains have non-zero balances
const activeChains = [
  'bitcoin',  'aptos',     'avax',
  'doge',     'berachain', 'cardano',
  'ethereum', 'arbitrum',  'stellar',
  'optimism', 'sui',       'xdai',
  'solana',   'bsc',       'near',
  'polygon',  'base',      'zcash',
  'tron',     'ripple',    'ton'
];

module.exports = {
  timetravel: false,
  methodology: 'TVL calculated from tokens locked in NEAR Intents Verifier contract across multiple chains',
  ...Object.fromEntries(activeChains.map(chain => [chain, { tvl }]))
};
