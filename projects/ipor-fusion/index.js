const sdk = require('@defillama/sdk')
const { getConfig } = require('../helper/cache')

const IPOR_GITHUB_ADDRESSES_URL = "https://raw.githubusercontent.com/IPOR-Labs/ipor-abi/refs/heads/main/mainnet/addresses.json";

const DEBUG_LOGGING = false; // Set to true to enable debug logs
const debugLog = (...args) => DEBUG_LOGGING && console.log(...args);

let totalVaultsProcessed = 0;

// Logs the USD value each vault contributes. Enabled by setting DEBUG_LOGGING = true.
async function logVaultUsdValues(api, chain, vaults, calls) {
  const assets = await api.multiCall({ calls, abi: 'address:asset', permitFailure: true })
  const totalAssets = await api.multiCall({ calls, abi: 'uint256:totalAssets', permitFailure: true })

  const rows = await Promise.all(calls.map(async (vaultAddress, i) => {
    let usd = 0
    if (assets[i] && totalAssets[i])
      usd = Number(await sdk.Balances.getUSDValue({ [`${chain}:${assets[i]}`]: totalAssets[i] }, api.timestamp)) || 0
    return { name: vaults[i].name || 'Unknown', vault: vaultAddress, usd }
  }))

  rows.sort((a, b) => b.usd - a.usd)
  console.log(`\n[Fusion (by IPOR)] Per-vault USD value on ${chain}:`)
  rows.forEach(({ name, vault, usd }) => {
    console.log(`  ${Math.round(usd).toLocaleString().padStart(15)} USD  ${vault}  ${name}`)
  })
  console.log(`  ${Math.round(rows.reduce((s, r) => s + r.usd, 0)).toLocaleString().padStart(15)} USD  TOTAL (${rows.length} vaults)\n`)
}

async function tvl(api) {
  const config  = await getConfig('ipor/assets', IPOR_GITHUB_ADDRESSES_URL);

  const chain = api.chain === "avax" ? 'avalanche' : api.chain;

  const chainConfig = config[chain];
  if (!chainConfig || !chainConfig.vaults) {
    debugLog(`[Fusion (by IPOR)] No vaults found for chain: ${chain}`);
    return {};
  }
  
  debugLog(`[Fusion (by IPOR)] Processing ${chainConfig.vaults.length} vaults on ${chain}:`);
  
  const calls = chainConfig.vaults.map((vault, index) => {
    debugLog(`  Vault ${index + 1}/${chainConfig.vaults.length}: ${vault.PlasmaVault} (${vault.name || 'Unknown'})`);
    return vault.PlasmaVault;
  });

  totalVaultsProcessed += calls.length;

  debugLog(`[Fusion (by IPOR)] Total vaults processed on ${chain}: ${calls.length}`);
  debugLog(`[Fusion (by IPOR)] GRAND TOTAL vaults processed across all chains so far: ${totalVaultsProcessed}`);

  if (DEBUG_LOGGING) {
    await logVaultUsdValues(api, chain, chainConfig.vaults, calls)
  }

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
