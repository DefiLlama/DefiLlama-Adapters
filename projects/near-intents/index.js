const axios = require('axios');
const chains = require('../helper/chains.json');

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
      cachedBalances = response.data.balances;
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

module.exports = {
  timetravel: false,
  methodology: 'TVL calculated from tokens locked in NEAR Intents Verifier contract across multiple chains',
  ...Object.fromEntries(chains.map(chain => [chain, { tvl }]))
};
