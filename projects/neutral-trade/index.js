const {
  KAMINO_VAULTS,
  ACCOUNTABLE_STRATEGIES,
  HYPERLIQUID_VAULTS,
  START_TIMESTAMP,
  TOKENS,
  VAULTS_REGISTRY_URL,
  DRIFT_VAULT_PROGRAM_ID,
  NT_VAULT_PROGRAM_ID,
} = require("./constants");
const { getConfig } = require("../helper/cache");
const { getTvl: getDriftVaultTvl } = require("./utils/drift");
const { getTvl: getHyperliquidVaultTvl } = require("./utils/hyperliquid");
const { getTvl: getNtVaultTvl } = require("./utils/ntVaults");
const { addTvl: addVoltrTvl } = require("./utils/voltr");
const { getCuratorTvlAccountableVault, kaminoLendVaultTvl } = require("../helper/curators");

async function accountable_vaults_tvl(api) {
  const vaults = await api.multiCall({ abi: 'address:vault', calls: ACCOUNTABLE_STRATEGIES[api.chain] });
  await getCuratorTvlAccountableVault(api, vaults);
}

async function getDriftAndBundleVaults() {
  const vaults = await getConfig("neutral-trade/vaults", VAULTS_REGISTRY_URL);
  if (!Array.isArray(vaults)) return { driftAddresses: [], bundleVaults: [] };
  const driftAddresses = vaults
    .filter((v) => v.type === "Drift")
    .map((v) => v.vaultAddress);
  const bundleVaults = vaults
    .filter((v) => v.type === "Bundle")
    .map((v) => {
      const token = TOKENS[v.depositToken];
      if (!token) return null;
      return {
        address: v.vaultAddress,
        token,
        programId: v.bundleProgramId ?? NT_VAULT_PROGRAM_ID,
      };
    })
    .filter(Boolean);
  return { driftAddresses, bundleVaults };
}

async function drift_vaults_tvl(api) {
  const { driftAddresses } = await getDriftAndBundleVaults();
  if (driftAddresses.length) await getDriftVaultTvl(api, driftAddresses);
}

async function kamino_vaults_tvl(api) {
  await kaminoLendVaultTvl(api, { vaults: KAMINO_VAULTS.map(vault => vault.address) });
}

async function hyperliquid_vaults_tvl(api) {
  for (const vault of HYPERLIQUID_VAULTS) {
    const token_tvl = await getHyperliquidVaultTvl(vault.address);
    api.add(vault.token.mint, token_tvl);
  }
}

async function nt_vaults_tvl(api) {
  const { bundleVaults } = await getDriftAndBundleVaults();
  for (const vault of bundleVaults) {
    try {
      const token_tvl = await getNtVaultTvl(vault.address, vault.programId);
      api.add(vault.token.mint, token_tvl);
    } catch (e) {
      console.log(`Failed to fetch bundle vault ${vault.address}: ${e.message}`);
    }
  }
}

async function voltr_vaults_tvl(api) {
  await addVoltrTvl(api);
}

async function tvl(api) {
  // await drift_vaults_tvl(api);
  await kamino_vaults_tvl(api);
  await hyperliquid_vaults_tvl(api);
  await nt_vaults_tvl(api);
  await voltr_vaults_tvl(api);
}


module.exports = {
  start: START_TIMESTAMP,
  timetravel: false,
  hallmarks: [
    ["2026-04-01", "Drift hack"]
  ],
  doublecounted: true,
  methodology: "The combined TVL and PnL of public and private vaults. Kamino USDC Max Yield uses its onchain prevAumSf, converted from fixed point to underlying token units. Accountable strategies resolve their vaults onchain via vault(); each vault's totalSupply is converted to underlying assets via convertToAssets. These positions overlap with Kamino Lending and Accountable's TVL and borrowed assets.",
  solana: { tvl },
};

for (const chain of Object.keys(ACCOUNTABLE_STRATEGIES)) {
  module.exports[chain] = { tvl: accountable_vaults_tvl };
}
