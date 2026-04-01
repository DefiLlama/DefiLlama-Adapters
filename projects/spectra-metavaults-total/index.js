const sdk = require("@defillama/sdk");
const { getLogs } = require("../helper/cache/getLogs");
const { getConfig } = require("../helper/cache");
const config = require("../spectra-metavaults/config.json");

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const CHAIN_TO_API_NETWORK = {
  ethereum: "ethereum",
  arbitrum: "arbitrum",
  base: "base",
  avax: "avalanche",
  katana: "katana",
  flare: "flare",
};

const SPECTRA_API_BASE = "https://api.spectra.finance/v1";

// ---------------------------------------------------------------------------
// ABIs
// ---------------------------------------------------------------------------

const METAVAULT_DEPLOYED_EVENT =
  "event MetavaultDeployed(address indexed owner, address indexed wrapper, address indexed infraVault)";

// ---------------------------------------------------------------------------
// Spectra API: owner address → metavault object
// ---------------------------------------------------------------------------

async function fetchMetavaultOwnerMap(chain) {
  const ownerMap = {};
  const network = CHAIN_TO_API_NETWORK[chain];
  if (!network) return ownerMap;

  try {
    const metavaults = await getConfig(
      `spectra-metavaults-api/${network}`,
      `${SPECTRA_API_BASE}/${network}/metavaults`
    );
    if (!Array.isArray(metavaults)) return ownerMap;
    for (const mv of metavaults) {
      if (mv.address) ownerMap[mv.address.toLowerCase()] = mv;
      if (mv.remote) {
        for (const remoteChainId of Object.keys(mv.remote)) {
          const remote = mv.remote[remoteChainId];
          if (remote?.address) ownerMap[remote.address.toLowerCase()] = mv;
        }
      }
    }
  } catch (e) {
    sdk.log(`spectra-metavaults-total: failed to fetch API for ${network}:`, e.message);
  }

  return ownerMap;
}

// ---------------------------------------------------------------------------
// Core data fetching
// ---------------------------------------------------------------------------

async function getMetavaultData(api, metavaultSources) {
  if (!metavaultSources.length) return null;

  // Fetch API owner map (used to filter vaults not known to Spectra API)
  const apiOwnerMap = await fetchMetavaultOwnerMap(api.chain);

  // Fetch MetavaultDeployed logs from every registry, merge results
  const logsPerSource = await Promise.all(
    metavaultSources.map(({ metavaultRegistry, fromBlock }) =>
      getLogs({
        api,
        target: metavaultRegistry,
        eventAbi: METAVAULT_DEPLOYED_EVENT,
        onlyArgs: true,
        fromBlock,
      })
    )
  );

  // Deduplicate wrappers across registries
  const wrappersMap = {};
  for (const logs of logsPerSource) {
    for (const log of logs) {
      const { owner, wrapper, infraVault: infraVaultFromEvent } = log;
      const key = wrapper.toLowerCase();
      if (!wrappersMap[key]) {
        wrappersMap[key] = { owner, wrapper, infraVaultFromEvent };
      }
    }
  }

  const wrappers = Object.values(wrappersMap);
  if (!wrappers.length) return null;

  // Validate each wrapper exists in at least one registry (count > 0)
  const registryCounts = await Promise.all(
    metavaultSources.map(({ metavaultRegistry }) =>
      api.multiCall({
        calls: wrappers.map(({ wrapper }) => ({
          target: metavaultRegistry,
          params: [wrapper],
        })),
        abi: "function metavaultCount(address) view returns (uint256)",
        permitFailure: true,
      })
    )
  );

  const validWrappers = wrappers.filter((_, i) =>
    registryCounts.some((counts) => {
      const v = counts[i];
      if (!v) return false;
      try { return BigInt(v) > 0n; } catch { return false; }
    })
  );
  if (!validWrappers.length) return null;

  // Resolve the on-chain infraVault address for each valid wrapper
  const wrapperInfraVaults = await api.multiCall({
    calls: validWrappers.map(({ wrapper }) => ({ target: wrapper })),
    abi: "function getInfraVault() view returns (address)",
    permitFailure: true,
  });

  // Build deduped infraVault list + infraVault → owner map
  const uniqueInfraVaults = {};
  const infraVaultToOwner = {};
  validWrappers.forEach(({ owner, infraVaultFromEvent }, i) => {
    let infraVault = wrapperInfraVaults[i];
    if (!infraVault || infraVault.toLowerCase() === ZERO_ADDRESS)
      infraVault = infraVaultFromEvent;
    if (!infraVault || infraVault.toLowerCase() === ZERO_ADDRESS) return;
    const infraKey = infraVault.toLowerCase();
    uniqueInfraVaults[infraKey] = infraVault;
    infraVaultToOwner[infraKey] = (typeof owner === "string" ? owner : "").toLowerCase();
  });

  const infraVaults = Object.values(uniqueInfraVaults);
  if (!infraVaults.length) return null;

  const [assets, totalAssets] = await Promise.all([
    api.multiCall({
      calls: infraVaults.map((v) => ({ target: v })),
      abi: "function asset() view returns (address)",
      permitFailure: true,
    }),
    api.multiCall({
      calls: infraVaults.map((v) => ({ target: v })),
      abi: "function totalAssets() view returns (uint256)",
      permitFailure: true,
    }),
  ]);

  return { assets, totalAssets, infraVaults, infraVaultToOwner, apiOwnerMap };
}

// ---------------------------------------------------------------------------
// TVL
// ---------------------------------------------------------------------------

const tvl = async (api) => {
  const sources = config[api.chain];
  const metavaultSources = sources.filter(({ metavaultRegistry }) => metavaultRegistry);

  const data = await getMetavaultData(api, metavaultSources);
  if (!data) return;

  const { assets, totalAssets, infraVaults, infraVaultToOwner, apiOwnerMap } = data;

  assets.forEach((asset, i) => {
    const balance = totalAssets[i];
    if (!asset || asset.toLowerCase() === ZERO_ADDRESS || !balance) return;

    // Only count metavaults known to the Spectra API
    const infraKey = infraVaults[i].toLowerCase();
    const ownerAddr = infraVaultToOwner[infraKey];
    const apiMetavault = ownerAddr ? apiOwnerMap[ownerAddr] : undefined;
    if (!apiMetavault) return;

    api.add(asset, balance);
  });
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  methodology: "TVL is the total value of assets deposited in Spectra MetaVaults.",
  hallmarks: [["2026-02-12", "MetaVaults Launch"]],
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl };
});