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

// Beefy chain name to our chain name mapping
// This maps Beefy's chain names to our standardized names
const beefyChainNameMapping = {
  'ethereum': 'ethereum',
  'optimism': 'optimism',
  'cronos': 'cronos',
  'rsk': 'rsk',
  'bsc': 'bsc',
  'gnosis': 'xdai',
  'xdai': 'xdai',
  'fuse': 'fuse',
  'heco': 'heco',
  'polygon': 'polygon',
  'monad': 'monad',
  'sonic': 'sonic',
  'manta': 'manta',
  'fantom': 'fantom',
  'fraxtal': 'fraxtal',
  'zksync': 'era',
  'era': 'era',
  'hyperliquid': 'hyperliquid',
  'metis': 'metis',
  'polygonzkevm': 'polygon_zkevm',
  'polygon_zkevm': 'polygon_zkevm',
  'zkevm': 'polygon_zkevm',
  'lisk': 'lisk',
  'moonbeam': 'moonbeam',
  'moonriver': 'moonriver',
  'sei': 'sei',
  'kava': 'kava',
  'mantle': 'mantle',
  'saga': 'saga',
  'canto': 'canto',
  'base': 'base',
  'plasma': 'plasma',
  'mode': 'mode',
  'arbitrum': 'arbitrum',
  'celo': 'celo',
  'emerald': 'oasis',
  'oasis': 'oasis',
  'avalanche': 'avax',
  'avax': 'avax',
  'linea': 'linea',
  'berachain': 'berachain',
  'real': 'real',
  'scroll': 'scroll',
  'aurora': 'aurora',
  'harmony': 'harmony'
};

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchVaultDataWithRetry(retryCount = 0) {
  try {
    const vaultsResponse = await utils.fetchURL('https://api.beefy.finance/vaults');
    const vaults = vaultsResponse.data;

    console.log('Raw API response sample:', JSON.stringify(vaults[0], null, 2));

    if (!Array.isArray(vaults) || vaults.length === 0) {
      throw new Error('Invalid or empty vaults response');
    }

    console.log(`Fetched ${vaults.length} vaults from Beefy API`);

    const vaultsByChain = {};
    let mappedVaults = 0;
    let unmappedChains = new Set();
   
    vaults.forEach(vault => {
      // Try to get chain from vault object
      const beefyChainName = vault.chain;
      
      if (!beefyChainName) {
        console.log('Vault missing chain field:', vault.id);
        return;
      }
      
      // Map Beefy's chain name to our chain name
      const ourChainName = beefyChainNameMapping[beefyChainName.toLowerCase()];
      
      if (!ourChainName) {
        // Track unmapped chains for debugging
        unmappedChains.add(beefyChainName);
        return;
      }
     
      if (!vaultsByChain[ourChainName]) {
        vaultsByChain[ourChainName] = [];
      }

      const isDistressed = distressedAssets.some(asset =>
        vault.id.toLowerCase().includes(asset.toLowerCase())
      );

      if (!isDistressed && vault.earnContractAddress) {
        vaultsByChain[ourChainName].push({
          id: vault.id,
          address: vault.earnContractAddress,
          token: vault.tokenAddress,
          isBIFI: vault.id.toLowerCase().includes('bifi'),
          status: vault.status,
          chain: ourChainName
        });
        mappedVaults++;
      }
    });

    console.log(`Mapped ${mappedVaults} vaults across ${Object.keys(vaultsByChain).length} chains`);
    if (unmappedChains.size > 0) {
      console.log(`Unmapped Beefy chains:`, Array.from(unmappedChains).join(', '));
    }

    // Log vault counts per chain
    Object.entries(vaultsByChain).forEach(([chain, vaults]) => {
      console.log(`${chain}: ${vaults.length} vaults`);
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
    console.log('Using cached vault data');
    return _vaultDataCache;
  }

  // If a fetch is already in progress, wait for it instead of making another request
  if (_fetchPromise) {
    console.log('Waiting for in-progress vault data fetch');
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
     
      // Re-throw the error for hard failure
      throw error;
    } finally {
      // Clear the fetch promise so a new request can be made after cache expires
      _fetchPromise = null;
    }
  })();

  return _fetchPromise;
}


async function tvl(api) {
  const chain = api.chain;
  console.log(`\n=== Computing TVL for ${chain} ===`);
 
  // Fetch vault data from API - let errors propagate
  const vaultsByChain = await fetchVaultData();
  const vaults = vaultsByChain[chain] || [];

  console.log(`Found ${vaults.length} vaults for ${chain}`);

  if (vaults.length === 0) {
    console.log(`No vaults found for chain ${chain}`);
    return api.getBalances();
  }

  // Filter out BIFI staking vaults and inactive vaults
  const activeVaults = vaults.filter(v =>
    !v.isBIFI &&
    v.status === 'active'
  );

  console.log(`Active non-BIFI vaults: ${activeVaults.length}`);

  if (activeVaults.length > 0) {
    const vaultAddresses = activeVaults.map(v => v.address);
    console.log(`Querying ${vaultAddresses.length} vault addresses`);
    console.log(`First 3 vault addresses:`, vaultAddresses.slice(0, 3));
    
    let wants = [];
    try {
      wants = await api.multiCall({
        abi: vaultABI.want,
        calls: vaultAddresses,
        permitFailure: true,
      });
      console.log(`Successfully fetched ${wants.filter(w => w).length} want() addresses`);
    } catch (e) {
      console.log(`'want()' method failed for ${chain}, using fallback from API metadata`);
      wants = activeVaults.map(v => v.token);
    }

    const balances = await api.multiCall({
      abi: vaultABI.balance,
      calls: vaultAddresses,
      permitFailure: true,
    });

    console.log(`Fetched ${balances.filter(b => b && b > 0).length} non-zero balances`);

    let addedTokens = 0;
    vaultAddresses.forEach((vault, i) => {
      if (wants[i] && balances[i] && balances[i] > 0) {
        api.add(wants[i], balances[i]);
        addedTokens++;
        if (addedTokens <= 3) {
          console.log(`Added: ${wants[i]} = ${balances[i]}`);
        }
      }
    });

    console.log(`Added ${addedTokens} tokens to balances`);
  }

  const finalBalances = api.getBalances();
  console.log(`Final balance keys: ${Object.keys(finalBalances).length}`);
  return finalBalances;
}


async function staking(api) {
  const chain = api.chain;
  console.log(`\n=== Computing staking for ${chain} ===`);
 
  // Fetch vault data from API - let errors propagate
  const vaultsByChain = await fetchVaultData();
  const vaults = vaultsByChain[chain] || [];

  console.log(`Found ${vaults.length} total vaults for ${chain}`);

  // Filter for BIFI staking vaults
  const bifiVaults = vaults.filter(v =>
    v.isBIFI &&
    v.status === 'active'
  );

  console.log(`Active BIFI vaults: ${bifiVaults.length}`);

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
    console.log(`Successfully fetched ${wants.filter(w => w).length} want() addresses for staking`);
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

  console.log(`Fetched ${balances.filter(b => b && b > 0).length} non-zero staking balances`);

  let addedTokens = 0;
  vaultAddresses.forEach((vault, i) => {
    if (wants[i] && balances[i] && balances[i] > 0) {
      api.add(wants[i], balances[i]);
      addedTokens++;
    }
  });

  console.log(`Added ${addedTokens} staking tokens to balances`);

  return api.getBalances();
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
