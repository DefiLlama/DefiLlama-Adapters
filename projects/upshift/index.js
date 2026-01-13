const abi = require('./vaultsv2.json')
const { sui } = require("../helper/chain/rpcProxy");
const axios = require("axios");
const { getConfig } = require('../helper/cache');

const suiVaultsEndpoint = "https://vaults.api.sui-prod.bluefin.io/api/v1/vaults/info";
const vaultsApiEndpoint = "https://api.augustdigital.io/api/v1/tokenized_vault?status=active&load_subaccounts=false&load_snapshots=false";
const PACKAGE_ID =
  "0xc83d5406fd355f34d3ce87b35ab2c0b099af9d309ba96c17e40309502a49976f";

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
  31612: "mezo"
};

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
    if (vault.is_visible === false) continue;
    
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
  const vaults = (
    await axios.get(suiVaultsEndpoint)
  ).data.Vaults;
  for (const vault of Object.values(vaults)) {
    const vaultTvl = await sui.query({
      target: `${PACKAGE_ID}::vault::get_vault_tvl`,
      contractId: vault.ObjectId,
      typeArguments: [vault.DepositCoinType, vault.ReceiptCoinType],
      sender:
        "0xbaef681eafe323b507b76bdaf397731c26f46a311e5f3520ebb1bde091fff295",
    });
    api.add(vault.DepositCoinType, vaultTvl[0]);
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