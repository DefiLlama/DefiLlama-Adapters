const { getConfig } = require('../helper/cache')

const IPOR_GITHUB_ADDRESSES_URL = "https://raw.githubusercontent.com/IPOR-Labs/ipor-abi/refs/heads/main/mainnet/addresses.json";

const DEBUG_LOGGING = false; // Set to true to enable debug logs
const debugLog = (...args) => DEBUG_LOGGING && console.log(...args);

let totalVaultsProcessed = 0;

async function tvl(api) {
  const config  = await getConfig('ipor/assets', IPOR_GITHUB_ADDRESSES_URL);

  const chain = api.chain === "avax" ? 'avalanche' : api.chain;

  const chainConfig = config[chain];
  if (!chainConfig || !chainConfig.vaults) {
    debugLog(`[IPOR Fusion] No vaults found for chain: ${chain}`);
    return {};
  }
  
  debugLog(`[IPOR Fusion] Processing ${chainConfig.vaults.length} vaults on ${chain}:`);
  
  const calls = chainConfig.vaults.map((vault, index) => {
    debugLog(`  Vault ${index + 1}/${chainConfig.vaults.length}: ${vault.PlasmaVault} (${vault.name || 'Unknown'})`);
    return vault.PlasmaVault;
  });

  totalVaultsProcessed += calls.length;
  
  debugLog(`[IPOR Fusion] Total vaults processed on ${chain}: ${calls.length}`);
  debugLog(`[IPOR Fusion] GRAND TOTAL vaults processed across all chains so far: ${totalVaultsProcessed}`);
  
  return api.erc4626Sum2({ calls })
}

module.exports = {
  methodology: `Counts the tokens deposited into IPOR Fusion Vaults.`,
  hallmarks: [
    ["2024-09-30", "Fusion Vaults Rollout"]
  ],
  ethereum: { tvl },
  arbitrum: { tvl },
  base: { tvl },
  unichain: { tvl },
  ink: { tvl },
  tac: { tvl },
  plasma: { tvl },
  avax: { tvl }
};
