const abi = require('./vaultsv2.json')
const sui = require('../helper/chain/sui');
const { getConfig } = require('../helper/cache');

const vaultsApiEndpoint = "https://api.augustdigital.io/api/v1/tokenized_vault?status=active&load_subaccounts=false&load_snapshots=false";
// Chain ID to chain name mapping
const chainIdToName = {
  1: 'ethereum',
  56: 'bsc',
  8453: 'base',
  43114: 'avax',
  999: 'hyperliquid',
  143: 'monad',
  9745: 'plasma',
  14: 'flare',
  31612: "mezo",
  57073: "ink",
};

const suiVaultsToInclude = [
  "0x94c2826b24e44f710c5f80e3ed7ce898258d7008e3a643c894d90d276924d4b9",
  "0xfaf4d0ec9b76147c926c0c8b2aba39ea21ec991500c1e3e53b60d447b0e5f655",
  "0x323578c2b24683ca845c68c1e2097697d65e235826a9dc931abce3b4b1e43642",
  "0x1fdbd27ba90a7a5385185e3e0b76477202f2cadb0e4343163288c5625e7c5505",
  "0x30844745c8197fdaf9fe06c4ffeb73fe05c092ce0040674a3758dbfcb032a1f4",
];

// V1 vault types (ERC4626 compatible)
const v1VaultTypes = ['tokenizedVault', 'lendingPool'];
// V2 vault types (multiAssetVault)
const v2VaultTypes = ['multiAssetVault'];

// Fetch vaults from API and organize by chain and type
async function getVaultsConfig() {
  const vaults = await getConfig('upshift/vaults', vaultsApiEndpoint);
  
  const config = {};
  const v2Vaults = {};
  
  for (const vault of vaults) {
    // Filter out vaults where is_visible is false
    if (vault.status !== "active") continue;
    
    const chainName = chainIdToName[vault.chain];
    if (!chainName) continue; // Skip unsupported chains
    
    const address = vault.address;
    const internalType = vault.internal_type;
    
    // Categorize as v1 or v2 based on internal_type
    if (v1VaultTypes.includes(internalType)) {
      if (!config[chainName]) config[chainName] = [];
      config[chainName].push(address);
    } else if (v2VaultTypes.includes(internalType)) {
      if (!v2Vaults[chainName]) v2Vaults[chainName] = [];
      v2Vaults[chainName].push(address);
    }
  }
  
  return { config, v2Vaults };
}



// Custom function to handle v2 vaults with getTotalAssets
async function sumV2Vaults(api, vaults) {
  const assets = await api.multiCall({ abi: abi[1], calls: vaults })
  const totalAssets = await api.multiCall({ abi: abi[0], calls: vaults })
  
  api.addTokens(assets, totalAssets)
}

const suiVaultsTvl = async (api) => {
  const vaultObjects = await sui.getObjects(suiVaultsToInclude);
  for (const vault of vaultObjects) {
    if (!vault) continue;
    const depositCoinType = vault.type.split('<')[1].split(',')[0].trim();
    const balance = vault.fields?.balance;
    if (balance) api.add(depositCoinType, balance);
  }
}

// Create a TVL function factory that fetches vault config
function createTvlFunction(chainName) {
  return async (api) => {
    const vaultsConfig = await getVaultsConfig();
    if (!vaultsConfig) return api.getBalances();
    
    const { config = {}, v2Vaults = {} } = vaultsConfig;
    
    // Handle ERC4626 vaults (v1) if they exist for this chain
    if (config[chainName]) {
      await api.erc4626Sum({ calls: config[chainName], isOG4626: true })
    }
    
    // Handle v2 vaults if they exist for this chain
    if (v2Vaults[chainName]) {
      await sumV2Vaults(api, v2Vaults[chainName])
    }
    
    return api.getBalances()
  }
}

// Get all supported chain names from the mapping
const supportedChains = Object.values(chainIdToName);

module.exports = {
  doublecounted: true,
  methodology: "TVL is the sum of tokens deposited in erc4626 vaults",
}

// Initialize all supported chains (config will be fetched lazily when TVL is called)
supportedChains.forEach(chain => {
  module.exports[chain] = {
    tvl: createTvlFunction(chain)
  }
});

module.exports.sui = {
  tvl: suiVaultsTvl,
}