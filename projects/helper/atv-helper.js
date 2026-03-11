const { sumTokens2 } = require('./unwrapLPs');

/**
 * Calculate cumulative TVL for multiple vaults with fallback strategy
 * @param {Object} api - DefiLlama API object
 * @param {Array} vaultConfigs - Array of vault configuration objects
 * @returns {Object} Balances object
 */
async function getAtvCumulativeTvl(api, vaultConfigs) {
  const tokensAndOwners = [];

  for (const config of vaultConfigs) {
    const { address: vaultAddress, type: vaultType = 'ATV-111', additionalTokens = [] } = config;
    const tokens = await getAtvVaultTokens(api, vaultAddress, vaultType, additionalTokens);
    
    tokens.forEach(token => {
      tokensAndOwners.push([token, vaultAddress]);
    });
  }

  return sumTokens2({ api, tokensAndOwners });
}

/**
 * Generic helper for Aarna ATV vault TVL calculation
 * Supports both individual vault tracking and cumulative protocol TVL
 */

/**
 * Get tokens held by an ATV vault with different strategies
 * @param {Object} api - DefiLlama API object
 * @param {string} vaultAddress - Address of the ATV vault
 * @param {string} vaultType - Type of vault: 'ATV-802', 'ATV-808', 'ATV-111'
 * @param {Array} additionalTokens - Additional hardcoded tokens (for ATV-111)
 * @returns {Array} Array of token addresses
 */
async function getAtvVaultTokens(api, vaultAddress, vaultType = 'ATV-111', additionalTokens = []) {
  // Always try to get dynamic tokens from vault contract
  const [_, inputTokens] = await api.call({
    abi: ATV_ABIS.getInputToken,
    target: vaultAddress,
    permitFailure: true,
  });

  const uTokens = await api.call({
    abi: ATV_ABIS.getUTokens,
    target: vaultAddress,
    permitFailure: true,
  });

  // Combine dynamic tokens
  const dynamicTokens = []
    .concat(inputTokens || [])
    .concat(uTokens || []);

  let allTokens = dynamicTokens;

  // For ATV-111 vaults, add additional hardcoded tokens (compound/aave USDC)
  if (vaultType === 'ATV-111') {
    allTokens = dynamicTokens.concat(additionalTokens);
  }
  
  // Remove duplicates and filter out null/undefined
  const finalTokens = [...new Set(allTokens.filter(Boolean))];
  
  // If no dynamic tokens found and vault type doesn't support fallback, return empty
  if (finalTokens.length === 0 && vaultType !== 'ATV-111') {
    return [];
  }
  
  // For ATV-111, always include additional tokens even if dynamic fetch fails
  return vaultType === 'ATV-111' && finalTokens.length === 0 ? additionalTokens : finalTokens;
}

/**
 * Calculate TVL for a single ATV vault with fallback strategy
 * @param {Object} api - DefiLlama API object
 * @param {string} vaultAddress - Address of the ATV vault
 * @param {string} vaultType - Type of vault: 'ATV-802', 'ATV-808', 'ATV-111'
 * @param {Array} additionalTokens - Additional tokens for ATV-111 vaults
 * @returns {Object} Balances object
 */
async function getAtvVaultTvl(api, vaultAddress, vaultType = 'ATV-111', additionalTokens = []) {
  const tokensAndOwners = [];
  const tokens = await getAtvVaultTokens(api, vaultAddress, vaultType, additionalTokens);
  
  tokens.forEach(token => {
    tokensAndOwners.push([token, vaultAddress]);
  });

  return sumTokens2({ api, tokensAndOwners });
}

/**
 * Calculate cumulative TVL across multiple ATV vaults (legacy function)
 * @param {Object} api - DefiLlama API object
 * @param {Array} vaultAddresses - Array of vault addresses
 * @param {Array} fallbackTokens - Fallback tokens if dynamic fetching fails
 * @returns {Object} Balances object
 */
async function getAtvCumulativeTvlLegacy(api, vaultAddresses, fallbackTokens = []) {
  const tokensAndOwners = [];

  for (const vaultAddress of vaultAddresses) {
    const tokens = await getAtvVaultTokens(api, vaultAddress, 'ATV-111', fallbackTokens);
    
    tokens.forEach(token => {
      tokensAndOwners.push([token, vaultAddress]);
    });
  }

  return sumTokens2({ api, tokensAndOwners });
}

/**
 * Generate a complete DeFiLlama export for ATV vaults
 * Note: Individual vault breakdowns must be separate projects due to DeFiLlama constraints
 * @param {Object} config - Configuration object
 * @param {string} config.methodology - Methodology description
 * @param {Object} config.vaults - Vault configuration object (can be nested by chain)
 * @param {Array|Object} config.fallbackTokens - Fallback tokens (can be array or object by chain)
 * @param {Object} config.storageContracts - Storage contracts by chain and vault (optional)
 * @param {boolean} config.doublecounted - Whether TVL is double counted
 * @returns {Object} DeFiLlama export object
 */
function generateAtvExport(config) {
  const {
    methodology = 'TVL is calculated as the value of all input and yield-bearing tokens held in ATV vault contracts.',
    vaults = {},
    fallbackTokens = [],
    storageContracts = {},
    doublecounted = false,
    chains = ['ethereum']
  } = config;

  const exportObject = {
    doublecounted,
    methodology,
  };

  // Add chain-specific exports (only cumulative TVL due to DeFiLlama constraints)
  chains.forEach(chain => {
    // Handle both old structure (vaults directly) and new structure (vaults.chain)
    const chainVaults = vaults[chain] || vaults;
    const chainStorageContracts = storageContracts[chain] || {};
    
    // Extract vault addresses and create vault configs with proper typing
    let vaultConfigs = [];
    if (Array.isArray(chainVaults)) {
      vaultConfigs = chainVaults.map(vaultAddress => ({
        address: vaultAddress,
        type: 'ATV-111', // Default type
        additionalTokens: fallbackTokens[chain] || fallbackTokens
      }));
    } else {
      vaultConfigs = Object.entries(chainVaults).map(([vaultKey, vaultData]) => {
        const vaultAddress = vaultData.address || vaultData;
        return {
          address: vaultAddress,
          type: vaultKey, // Use the key (e.g., 'ATV-802', 'ATV-808', 'ATV-111') as vault type
          additionalTokens: vaultKey === 'ATV-111' ? (fallbackTokens[chain] || fallbackTokens) : [],
          storage: chainStorageContracts[vaultKey]
        };
      });
    }

    exportObject[chain] = {
      // Total cumulative TVL with direct method support
      tvl: async (api) => {
        // Check if we have storage contracts or ATVPTMAX vaults with getCurrentTVL
        const hasDirectMethods = vaultConfigs.some(config => 
          (config.storage && !config.storage.startsWith('STORAGE_ADDRESS')) || config.type === 'ATVPTMAX'
        );

        if (hasDirectMethods) {
          // Use mixed approach: direct where available, fallback otherwise
          let totalUsd = 0;
          const fallbackVaults = [];

          for (const config of vaultConfigs) {
            // ATVPTMAX uses getCurrentTVL directly on the vault contract
            if (config.type === 'ATVPTMAX') {
              const tvlInUsd = await api.call({
                abi: ATV_ABIS.getCurrentTVL,
                target: config.address,
                permitFailure: true,
              });
              
              if (tvlInUsd) {
                totalUsd += Number(tvlInUsd) / 1e18;
              } else {
                fallbackVaults.push(config);
              }
            } else if (config.storage && !config.storage.startsWith('STORAGE_ADDRESS')) {
              const tvlInUsd = await api.call({
                abi: ATV_ABIS.calculatePoolInUsd,
                target: config.storage,
                params: [config.address],
                permitFailure: true,
              });
              
              if (tvlInUsd) {
                totalUsd += Number(tvlInUsd) / 1e18;
              } else {
                fallbackVaults.push(config);
              }
            } else {
              fallbackVaults.push(config);
            }
          }

          // Add direct USD value
          if (totalUsd > 0) {
            api.addUSDValue(totalUsd);
          }

          // Process fallback vaults if any
          if (fallbackVaults.length > 0) await getAtvCumulativeTvl(api, fallbackVaults);
          

          return api.getBalances();
        } else {
          // Use fallback method for all vaults
          return getAtvCumulativeTvl(api, vaultConfigs);
        }
      },
    };
  });

  return exportObject;
}

/**
 * Generate a single vault export for individual vault projects
 * @param {Object} config - Configuration object
 * @returns {Object} DeFiLlama export object
 */
function generateSingleVaultExport(config) {
  const {
    methodology = 'TVL is calculated as the value of all input and yield-bearing tokens held in this ATV vault contract.',
    vaultAddress,
    storageContract = null,
    fallbackTokens = [],
    vaultType = 'ATV-111',
    doublecounted = false,
    chain = 'ethereum'
  } = config;

  return {
    doublecounted,
    methodology,
    [chain]: {
      tvl: async (api) => {
        // Check if storage contract is configured and valid
        if (storageContract && storageContract !== 'STORAGE_ADDRESS_TO_BE_FILLED') {
          // Try direct method first
          const tvlInUsd = await api.call({
            abi: ATV_ABIS.calculatePoolInUsd,
            target: storageContract,
            params: [vaultAddress],
            permitFailure: true,
          });
          
          if (tvlInUsd) {
            const usdValue = Number(tvlInUsd) / 1e18;
            api.addUSDValue(usdValue);
            return api.getBalances();
          }
          
          // If direct method failed, fall back to token-based method
          return await getAtvVaultTvl(api, vaultAddress, vaultType, fallbackTokens);
        } else {
          // Use fallback token-based method
          return await getAtvVaultTvl(api, vaultAddress, vaultType, fallbackTokens);
        }
      },
    }
  };
}

/**
 * Standard ABI definitions for ATV vaults
 */
const ATV_ABIS = {
  getInputToken: 'function getInputToken() view returns (address[], address[])',
  getUTokens: 'function getUTokens() view returns (address[])',
  // Direct TVL calculation from storage contract
  calculatePoolInUsd: 'function calculatePoolInUsd(address afiContract) view returns (uint256)',
  // Direct TVL calculation from vault contract (ATVPTMAX)
  getCurrentTVL: 'function getCurrentTVL() view returns (uint256)',
};

/**
 * Calculate TVL directly from storage contract (preferred method)
 * @param {Object} api - DefiLlama API object
 * @param {string} storageContract - Address of the storage contract
 * @param {string} vaultAddress - Address of the ATV vault
 * @returns {Object} Balances object with USD value
 */
async function getAtvVaultTvlDirect(api, storageContract, vaultAddress) {
  const tvlInUsd = await api.call({
    abi: ATV_ABIS.calculatePoolInUsd,
    target: storageContract,
    params: [vaultAddress],
    permitFailure: true,
  });

  if (!tvlInUsd) {
    // Return empty balances if call failed
    return api.getBalances();
  }

  // Convert from wei to USD (assuming the contract returns value in wei scale)
  // If contract returns direct USD value, remove the division by 1e18
  const usdValue = Number(tvlInUsd) / 1e18;
  api.addUSDValue(usdValue);
  return api.getBalances();
}

/**
 * Calculate cumulative TVL for multiple vaults using direct method
 * @param {Object} api - DefiLlama API object
 * @param {Array} vaultConfigs - Array of {vault, storage} objects
 * @returns {Object} Balances object with total USD value
 */
async function getAtvCumulativeTvlDirect(api, vaultConfigs) {
  let totalUsd = 0;

  for (const config of vaultConfigs) {
    const tvlInUsd = await api.call({
      abi: ATV_ABIS.calculatePoolInUsd,
      target: config.storage,
      params: [config.vault],
      permitFailure: true,
    });
    
    if (tvlInUsd) {
      // Convert from wei to USD (assuming the contract returns value in wei scale)
      // If contract returns direct USD value, remove the division by 1e18
      totalUsd += Number(tvlInUsd) / 1e18;
    }
  }

  api.addUSDValue(totalUsd);
  return api.getBalances();
}

module.exports = {
  getAtvVaultTokens,
  getAtvVaultTvl,
  getAtvCumulativeTvl,
  getAtvCumulativeTvlLegacy,
  getAtvVaultTvlDirect,
  getAtvCumulativeTvlDirect,
  generateAtvExport,
  generateSingleVaultExport,
  ATV_ABIS,
};
