const { sumTokens } = require('../helper/unwrapLPs');
const sdk = require('@defillama/sdk');
const utils = require('../helper/utils');


const distressedAssets = ['aleth']; 
let _vaultDataCache = null;
let _cacheTimestamp = null;
let _fetchPromise = null;
const CACHE_DURATION = 5 * 60 * 1000; 
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; 

// ABI for Beefy vaults
const vaultABI = {
  balance: 'function balance() view returns (uint256)',
  want: 'function want() view returns (address)',
  token: 'address:token',
  underlying: 'address:underlying',
};
// Supported chains 
const chains = {
  ethereum: 1,
  optimism: 10,
  cronos: 25,
  rsk: 30,
  bsc: 56,
  xdai: 100,
  fuse: 122,
  heco: 128,
  polygon: 137,
  monad: 143,
  sonic: 146,
  manta: 169,
  fantom: 250,
  fraxtal: 252,
  era: 324,
  hyperliquid: 999,
  metis: 1088,
  polygon_zkevm: 1101,
  lisk: 1135,
  moonbeam: 1284,
  moonriver: 1285,
  sei: 1329,
  kava: 2222,
  mantle: 5000,
  saga: 5464,
  canto: 7700,
  base: 8453,
  plasma: 9745,
  mode: 34443,
  arbitrum: 42161,
  celo: 42220,
  oasis: 42262,
  avax: 43114,
  linea: 59144,
  berachain: 80094,
  real: 111188,
  scroll: 534352,
  aurora: 1313161554,
  harmony: 1666600000
};

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchVaultDataWithRetry(retryCount = 0) {
  try {
    const vaultsResponse = await utils.fetchURL('https://api.beefy.finance/vaults');
    const vaults = vaultsResponse.data;

    if (!Array.isArray(vaults) || vaults.length === 0) {
      throw new Error('Invalid or empty vaults response');
    }

    const vaultsByChain = {};
    const supportedChainNames = Object.keys(chains);
   
    vaults.forEach(vault => {
      const chain = vault.chain;
      if (!supportedChainNames.includes(chain)) {
        return;
      }
     
      if (!vaultsByChain[chain]) {
        vaultsByChain[chain] = [];
      }

      const isDistressed = distressedAssets.some(asset =>
        vault.id.toLowerCase().includes(asset.toLowerCase())
      );

      if (!isDistressed && vault.earnContractAddress) {
        vaultsByChain[chain].push({
          id: vault.id,
          address: vault.earnContractAddress,
          token: vault.tokenAddress,
          isBIFI: vault.id.toLowerCase().includes('bifi'),
          status: vault.status,
          chain: vault.chain
        });
      }
    });

    return vaultsByChain;
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      console.warn(`Attempt ${retryCount + 1} failed to fetch vault data: ${error.message}. Retrying in ${RETRY_DELAY}ms...`);
      await delay(RETRY_DELAY);
      return fetchVaultDataWithRetry(retryCount + 1);
    } else {
      console.error(`Failed to fetch vault data after ${MAX_RETRIES} retries: ${error.message}`);
      throw error;
    }
  }
}

// Fetch vault data from Beefy API with caching and request deduplication
async function fetchVaultData() {
  const now = Date.now();
 
  // Return cached data if still valid
  if (_vaultDataCache && _cacheTimestamp && (now - _cacheTimestamp) < CACHE_DURATION) {
    return _vaultDataCache;
  }

  // If a fetch is already in progress, wait for it instead of making another request
  if (_fetchPromise) {
    return _fetchPromise;
  }

  // Create a new fetch promise and store it
  _fetchPromise = (async () => {
    try {
      const vaultsByChain = await fetchVaultDataWithRetry();
     
      // Only cache successful results
      _vaultDataCache = vaultsByChain;
      _cacheTimestamp = now;
     
      return vaultsByChain;
    } catch (error) {
      // If we have old cache, return it instead of failing completely
      if (_vaultDataCache) {
        console.warn('Using stale cache due to API failure');
        return _vaultDataCache;
      }
     
      // Return empty object to prevent crashes, but don't cache it
      console.error('Error fetching vault data and no cache available:', error.message);
      return {};
    } finally {
      // Clear the fetch promise so a new request can be made after cache expires
      _fetchPromise = null;
    }
  })();

  return _fetchPromise;
}


async function tvl(api) {
  const chain = api.chain;
 
  try {
    // Fetch vault data from API
    const vaultsByChain = await fetchVaultData();
    const vaults = vaultsByChain[chain] || [];

    if (vaults.length === 0) {
      console.log(`No vaults found for chain ${chain}`);
      return api.getBalances();
    }

    // Filter out BIFI staking vaults and inactive vaults
    const activeVaults = vaults.filter(v =>
      !v.isBIFI &&
      v.status === 'active'
    );

    if (activeVaults.length > 0) {
      const vaultAddresses = activeVaults.map(v => v.address);
      let wants = [];
      try {
        wants = await api.multiCall({
          abi: vaultABI.want,
          calls: vaultAddresses,
          permitFailure: true,
        });
      } catch (e) {
        console.log(`'want()' method failed for ${chain}, using fallback from API metadata`);
        wants = activeVaults.map(v => v.token);
      }

      const balances = await api.multiCall({
        abi: vaultABI.balance,
        calls: vaultAddresses,
        permitFailure: true,
      });

      vaultAddresses.forEach((vault, i) => {
        if (wants[i] && balances[i] && balances[i] > 0) {
          api.add(wants[i], balances[i]);
        }
      });
    }

    return api.getBalances();
  } catch (error) {
    console.error(`Error in ${chain} TVL:`, error.message);
    return {};
  }
}


async function staking(api) {
  const chain = api.chain;
 
  try {
    // Fetch vault data from API
    const vaultsByChain = await fetchVaultData();
    const vaults = vaultsByChain[chain] || [];

    // Filter for BIFI staking vaults
    const bifiVaults = vaults.filter(v =>
      v.isBIFI &&
      v.status === 'active'
    );

    if (bifiVaults.length === 0) {
      return {};
    }

    const vaultAddresses = bifiVaults.map(v => v.address);
    let wants = [];
    try {
      wants = await api.multiCall({
        abi: vaultABI.want,
        calls: vaultAddresses,
        permitFailure: true,
      });
    } catch (e) {
      // Fallback to token addresses from API metadata
      console.log(`'want()' method failed for ${chain}, using API metadata`);
      wants = bifiVaults.map(v => v.token);
    }
    const balances = await api.multiCall({
      abi: vaultABI.balance,
      calls: vaultAddresses,
      permitFailure: true,
    });

    vaultAddresses.forEach((vault, i) => {
      if (wants[i] && balances[i] && balances[i] > 0) {
        api.add(wants[i], balances[i]);
      }
    });

    return api.getBalances();
  } catch (error) {
    console.error(`Error in ${chain} staking:`, error.message);
    return {};
  }
}
module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
 
  methodology: 'Provides the current and live total value locked of each Beefy vault, which is the sum of the current market capitalisation of all of the assets currently held by the relevant vault, denominated in $USD. Fetches vault addresses from Beefy API, then queries actual onchain balances of underlying tokens in each vault contract.',
  ...Object.fromEntries(Object.keys(chains).map(chain => [chain, {
    tvl,
    staking,
  }]))
};
