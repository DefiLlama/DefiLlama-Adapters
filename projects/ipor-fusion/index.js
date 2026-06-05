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
    debugLog(`[Fusion (by IPOR)] No vaults found for chain: ${chain}`);
    return {};
  }
  
  // dedupe by PlasmaVault address
  const seen = new Set();
  const calls = [];
  for (const vault of chainConfig.vaults) {
    const key = vault.PlasmaVault.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    calls.push(vault.PlasmaVault);
  }

  totalVaultsProcessed += calls.length;

  debugLog(`[Fusion (by IPOR)] Total vaults processed on ${chain}: ${calls.length}`);
  debugLog(`[Fusion (by IPOR)] GRAND TOTAL vaults processed across all chains so far: ${totalVaultsProcessed}`);

  // permitFailure so vaults not yet deployed at a historical block are skipped instead of throwing
  return api.erc4626Sum2({ calls, permitFailure: true })
}

module.exports = {
  methodology: `Counts the tokens deposited into Fusion Vaults.`,
  hallmarks: [
    ["2024-09-30", "Fusion Vaults Rollout"],
    ["2025-10-24", "Fusion Points Program Launch"],
    ["2025-11-04", "xUSD Depeg DeFi Contagion"]
  ],
  ethereum: { tvl },
  arbitrum: { tvl },
  base: { tvl },
  unichain: { tvl },
  ink: { tvl },
  tac: { tvl },
  plasma: { tvl },
  avax: { tvl },
  katana: { tvl }
};
