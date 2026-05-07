const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { getCache, setCache, getConfig } = require("../helper/cache");
const ethers = require("ethers");
const config = require("./config.json");

// Chain name (as used in config.json) to Spectra API network slug
const CHAIN_TO_API_NETWORK = {
  ethereum: "ethereum",
  arbitrum: "arbitrum",
  base: "base",
  avax: "avalanche",
  katana: "katana",
  flare: "flare",
};

const SPECTRA_API_BASE = "https://api.spectra.finance/v1";

const LOG_CACHE_FOLDER = "logs";

/**
 * Cached wrapper for sdk.getEventLogs with noTarget (no contract address filter).
 * Modeled after the existing getLogs helper – generates a stable cache key from
 * chain + eventAbi, persists fetched logs, and only fetches the delta on
 * subsequent runs.
 */
async function getCachedEventLogs({ chain, fromBlock, toBlock, eventAbi }) {
  const iface = new ethers.Interface([eventAbi]);
  const fragment = iface.fragments[0];
  const topic = `${fragment.name}(${fragment.inputs.map((i) => i.type).join(",")})`;
  const key = `${chain}/noTarget-${topic}`;

  let cache = await getCache(LOG_CACHE_FOLDER, key);
  if (!cache || !cache.logs || fromBlock < cache.fromBlock) {
    cache = { logs: [], fromBlock, toBlock: undefined };
  }

  const parseLogs = (rawLogs) =>
    rawLogs.map((l) => {
      try {
        const parsed = iface.parseLog(l);
        // Spread named args (owner, infraVault, wrapper) to top-level
        // so consuming code can access log.owner / log.args[0] etc.
        const named = {};
        parsed.fragment.inputs.forEach((input, idx) => {
          named[input.name] = parsed.args[idx];
        });
        return { ...named, args: Array.from(parsed.args), blockNumber: l.blockNumber };
      } catch {
        return l; // already parsed or different format
      }
    });

  // If we already have logs up to (or near) the requested toBlock, just filter
  if (cache.toBlock && cache.toBlock + 2 >= toBlock) {
    const filtered = cache.logs.filter(
      (l) => l.blockNumber >= fromBlock && l.blockNumber <= toBlock
    );
    return parseLogs(filtered);
  }

  // Fetch only the new range (delta)
  const fetchFrom = cache.toBlock ?? fromBlock;
  const newLogs = await sdk.getEventLogs({
    chain,
    fromBlock: fetchFrom,
    toBlock,
    noTarget: true,
    eventAbi,
    entireLog: true,
  });

  cache.logs = cache.logs.concat(newLogs);
  cache.toBlock = toBlock;

  // Deduplicate by transactionHash + logIndex
  const seen = new Set();
  cache.logs = cache.logs.filter((l) => {
    const id = (l.transactionHash ?? l.hash) + (l.logIndex ?? l.index);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  await setCache(LOG_CACHE_FOLDER, key, cache);

  const filtered = cache.logs.filter(
    (l) => l.blockNumber >= fromBlock && l.blockNumber <= toBlock
  );
  return parseLogs(filtered);
}

const abi = {
  metavaultRegistry: {
    chainsCount: "function chainsCount(address metavault) view returns (uint256)",
  },
  metavault: {
    getInfraVault: "function getInfraVault() view returns (address)",
  },
  infraVault: {
    totalAssets: "function totalAssets() view returns (uint256)",
    asset: "function asset() view returns (address)",
  },
};

const ZERO_ADDRESS = ADDRESSES.null;
const metavaultWrapperInitializedEventAbi =
  "event MetaVaultWrapperInitialized(address indexed owner, address indexed infraVault, address indexed wrapper)";

const isMetavaultCountValid = (count) => {
  if (count === null || count === undefined) return false;
  try {
    return BigInt(count) >= 1n;
  } catch (e) {
    return +count >= 1;
  }
};

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
      if (mv.address) {
        ownerMap[mv.address.toLowerCase()] = mv;
      }
      if (mv.remote) {
        for (const remoteChainId of Object.keys(mv.remote)) {
          const remote = mv.remote[remoteChainId];
          if (remote?.address) {
            ownerMap[remote.address.toLowerCase()] = mv;
          }
        }
      }
    }
  } catch (e) {
    sdk.log(`spectra-metavaults: failed to fetch API for ${network}:`, e.message);
  }

  return ownerMap;
}

/**
 * Compute the Spectra-allocated amount for a metavault across all chains,
 * denominated in raw underlying token units (matching totalAssets units).
 *
 * "Spectra" = PT + YT + LP positions + wrapper IBT balances.
 */
function computeSpectraAllocation(metavault) {
  if (!metavault?.positions?.length) return 0;

  const underlyingDecimals = metavault.underlying?.decimals ?? metavault.decimals ?? 18;
  let totalSpectraUnderlying = 0;

  for (const pos of metavault.positions) {

    const ptDecimals = pos.decimals ?? 18;
    const pool = pos.pools?.[0];

    // --- PT balance ---
    const ptBalanceRaw = BigInt(pos.balance || 0);
    if (ptBalanceRaw > 0n) {
      let ptPriceUnderlying;
      if (pool?.ptPrice?.underlying != null) {
        ptPriceUnderlying = pool.ptPrice.underlying;
      } else if (pos.maturityValue?.underlying != null) {
        ptPriceUnderlying = pos.maturityValue.underlying;
      }
      if (ptPriceUnderlying != null) {
        totalSpectraUnderlying +=
          Number(ptBalanceRaw) / 10 ** ptDecimals * ptPriceUnderlying;
      }
    }

    // --- YT balance ---
    const ytBalanceRaw = BigInt(pos.yt?.balance || 0);
    if (ytBalanceRaw > 0n && pool?.ytPrice?.underlying != null) {
      totalSpectraUnderlying +=
        Number(ytBalanceRaw) / 10 ** ptDecimals * pool.ytPrice.underlying;
    }

    // --- LP balances (across all pools) ---
    if (pos.pools) {
      for (const p of pos.pools) {
        const lpBalanceRaw = BigInt(p.lpt?.balance || 0);
        if (lpBalanceRaw > 0n && p.lpt?.price?.underlying != null) {
          const lpDecimals = p.lpt.decimals ?? 18;
          totalSpectraUnderlying +=
            Number(lpBalanceRaw) / 10 ** lpDecimals * p.lpt.price.underlying;
        }
      }
    }

    // --- Wrapper IBT balance (IBT that wraps another token via Spectra) ---
    if (pos.ibt?.baseIbt?.balance) {
      const ibtBalanceRaw = BigInt(pos.ibt.baseIbt.balance);
      if (ibtBalanceRaw > 0n && pos.ibt?.price?.underlying != null) {
        const ibtDecimals = pos.ibt.decimals ?? 18;
        totalSpectraUnderlying +=
          Number(ibtBalanceRaw) / 10 ** ibtDecimals * pos.ibt.price.underlying;
      }
    }
  }

  // Convert from underlying floating-point back to raw token units
  return Math.floor(totalSpectraUnderlying * 10 ** underlyingDecimals);
}

const getMetavaultTVL = async (api, metavaultSources) => {
  if (!metavaultSources.length) return;

  const metavaultFromBlock = Math.min(
    ...metavaultSources.map(({ fromBlock }) => fromBlock)
  );
  let toBlock = api.block;
  if (!toBlock) {
    try {
      toBlock = await api.getBlock();
    } catch (e) {
      sdk.log(`spectra-metavaults: failed to get block for ${api.chain}:`, e.message);
      throw e;
    }
  }
  // Use a small buffer to avoid race conditions where the RPC node
  // hasn't synced the very latest block yet (observed on katana)
  toBlock = toBlock - 10;

  // Fetch API metavault data (for Spectra allocation deduction)
  const apiOwnerMap = await fetchMetavaultOwnerMap(api.chain);

  const logs = await getCachedEventLogs({
    chain: api.chain,
    fromBlock: metavaultFromBlock,
    toBlock,
    eventAbi: metavaultWrapperInitializedEventAbi,
  });

  const wrappersMap = {};
  logs.forEach((log) => {
    const owner = log.owner ?? log?.args[0];
    const wrapper = log.wrapper ?? log?.args[2];
    const infraVaultFromEvent = log.infraVault ?? log?.args[1];

    if (!owner || !wrapper) return;
    wrappersMap[wrapper.toLowerCase()] = { owner, wrapper, infraVaultFromEvent };
  });

  const wrappers = Object.values(wrappersMap);
  if (!wrappers.length) return;

  const registryCounts = await Promise.all(
    metavaultSources.map(({ metavaultRegistry }) =>
      api.multiCall({
        target: metavaultRegistry,
        calls: wrappers.map(({ owner }) => ({ params: [owner] })),
        abi: abi.metavaultRegistry.chainsCount,
        permitFailure: true,
      })
    )
  );

  const validWrappers = wrappers.filter((_, i) =>
    registryCounts.some((counts) => isMetavaultCountValid(counts[i]))
  );
  if (!validWrappers.length) return;

  const wrapperInfraVaults = await api.multiCall({
    calls: validWrappers.map(({ wrapper }) => ({ target: wrapper })),
    abi: abi.metavault.getInfraVault,
    permitFailure: true,
  });

  // Track infraVault to owner address for API lookup
  const uniqueInfraVaults = {};
  const infraVaultToOwner = {};
  validWrappers.forEach(({ owner, wrapper, infraVaultFromEvent }, i) => {
    let infraVault = wrapperInfraVaults[i];
    if (!infraVault || infraVault.toLowerCase() === ZERO_ADDRESS)
      infraVault = infraVaultFromEvent;
    if (!infraVault || infraVault.toLowerCase() === ZERO_ADDRESS) return;
    const infraKey = infraVault.toLowerCase();
    uniqueInfraVaults[infraKey] = infraVault;
    // owner from the event is the metavault identity (matches API mv.address)
    infraVaultToOwner[infraKey] = (typeof owner === 'string' ? owner : '').toLowerCase();
  });

  const infraVaults = Object.values(uniqueInfraVaults);
  if (!infraVaults.length) return;

  const [assets, totalAssets] = await Promise.all([
    api.multiCall({
      calls: infraVaults,
      abi: abi.infraVault.asset,
      permitFailure: true,
    }),
    api.multiCall({
      calls: infraVaults,
      abi: abi.infraVault.totalAssets,
      permitFailure: true,
    }),
  ]);

  assets.forEach((asset, i) => {
    const balance = totalAssets[i];
    if (!asset || asset.toLowerCase() === ZERO_ADDRESS || !balance) return;

    // Deduct the portion already deposited into Spectra (PT/YT/LP/wrapper IBT)
    // Skip entirely if we can't find this metavault in the API response
    const infraKey = infraVaults[i].toLowerCase();
    const ownerAddr = infraVaultToOwner[infraKey];
    const apiMetavault = ownerAddr ? apiOwnerMap[ownerAddr] : undefined;
    if (!apiMetavault) return;

    const spectraAmount = BigInt(computeSpectraAllocation(apiMetavault));
    const adjustedBalance = BigInt(balance) - spectraAmount;

    if (adjustedBalance > 0n) {
      api.add(asset, adjustedBalance.toString());
    }
  });
};

const tvl = async (api) => {
  const sources = config[api.chain];
  const metavaultSources = sources.filter(
    ({ metavaultRegistry }) => metavaultRegistry
  );
  await getMetavaultTVL(api, metavaultSources);
};

module.exports = {
  methodology: `TVL is the total value of assets deposited in Spectra MetaVaults, excluding the portion allocated to Spectra V2 (PT, YT, LP, wrapper IBT).`,
  hallmarks: [["2026-02-12", "MetaVaults Launch"]],
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl };
});