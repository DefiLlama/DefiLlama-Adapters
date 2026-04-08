const ADDRESSES = require("../helper/coreAssets.json");
const { function_view } = require("../helper/chain/aptos");
const { GraphQLClient, gql } = require("graphql-request");
const { sliceIntoChunks } = require("../helper/utils");
const { PromisePool } = require("@supercharge/promise-pool");

/**
 * Set YIELD_AI_TVL_DEBUG=1 for detailed vault/Moar/FA traces (console).
 * @defillama/sdk log() is a no-op unless LLAMA_DEBUG_MODE is set.
 */
const VERBOSE =
  process.env.YIELD_AI_TVL_DEBUG === "1" ||
  process.env.YIELD_AI_TVL_DEBUG === "true";

function logYieldAi(...args) {
  if (!VERBOSE) return;
  console.log("[yield-ai]", ...args);
}

function safeJsonSample(obj, maxLen = 800) {
  try {
    const s = JSON.stringify(obj);
    return s.length > maxLen ? `${s.slice(0, maxLen)}…` : s;
  } catch {
    return String(obj);
  }
}

const VAULT =
  "0x333d1890e0aa3762bb256f5caeeb142431862628c63063801f44c152ef154700";

const MOAR =
  "0xa3afc59243afb6deeac965d40b25d509bb3aebc12f502b8592c283070abc2e07";

const INDEXER_URL = "https://api.mainnet.aptoslabs.com/v1/graphql";
const PAGE_SIZE = 50;
const OWNER_BATCH_SIZE = 30;
const COIN_BALANCE_CONCURRENCY = 10;
const MOAR_LENS_CONCURRENCY = 8;

const APT = ADDRESSES.aptos.APT;
const COIN_BALANCE_FN = "0x1::coin::balance";
const APT_TYPE_ARG = "0x1::aptos_coin::AptosCoin";

const FA_BALANCES_QUERY = gql`
  query YieldAiFaBalances($addresses: [String!]!) {
    current_fungible_asset_balances(where: { owner_address: { _in: $addresses } }) {
      owner_address
      amount
      asset_type
      metadata {
        decimals
      }
    }
  }
`;

function unwrapVector(raw) {
  if (raw == null) return [];
  if (!Array.isArray(raw)) return [];
  if (raw.length === 1 && Array.isArray(raw[0])) return raw[0];
  return raw;
}

function normalizeSafeRow(entry) {
  if (Array.isArray(entry)) {
    const [safe_address, owner, paused, exists] = entry;
    return { safe_address, owner, paused, exists };
  }
  return {
    safe_address: entry.safe_address ?? entry.safeAddress,
    owner: entry.owner,
    paused: entry.paused,
    exists: entry.exists,
  };
}

function truthyExists(v) {
  if (v === true) return true;
  if (v === false || v == null) return false;
  if (typeof v === "string") return v === "true" || v === "1";
  return Boolean(v);
}

function normalizeAptosAddress(addr) {
  if (!addr || typeof addr !== "string") return null;
  const trimmed = addr.trim();
  const withPrefix = trimmed.startsWith("0x") ? trimmed : `0x${trimmed}`;
  return withPrefix.toLowerCase();
}

/** Moar / views return metadata inner; keep 0xa-style APT shorthand as-is (lower case). */
function normalizeUnderlyingTokenId(inner) {
  if (inner == null) return null;
  const s = String(inner).trim().toLowerCase();
  if (!s) return null;
  if (s === "0xa") return "0xa";
  return s.startsWith("0x") ? s : `0x${s}`;
}

function isNativeAptFaRow(assetType) {
  if (!assetType || typeof assetType !== "string") return false;
  return (
    assetType === APT ||
    assetType.toLowerCase() === APT.toLowerCase() ||
    assetType.endsWith("::aptos_coin::AptosCoin")
  );
}

function toIntegerString(v) {
  if (v == null) return null;
  if (typeof v === "bigint") return v.toString();
  if (typeof v === "number") {
    if (!Number.isFinite(v)) return null;
    return BigInt(Math.trunc(v)).toString();
  }
  const s = String(v).trim();
  if (!s) return null;
  const intPart = s.split(".")[0].split("e")[0].split("E")[0];
  if (!/^-?\d+$/.test(intPart)) return null;
  return intPart;
}

async function fetchMoarPoolsCached() {
  const pools = await function_view({
    functionStr: `${MOAR}::pool::get_all_pools`,
    chain: "aptos",
  });
  if (!Array.isArray(pools)) {
    logYieldAi("get_all_pools: unexpected shape", typeof pools);
    return [];
  }
  return pools.map((p, poolIndex) => ({
    poolIndex,
    underlyingInner: normalizeUnderlyingTokenId(p?.underlying_asset?.inner),
    is_paused: p?.is_paused === true,
    name: p?.name,
  }));
}

/**
 * @returns {{ safeAddresses: string[], ownerAddresses: string[] }}
 */
async function fetchExistingSafeAndOwnerAddresses() {
  const totalRaw = await function_view({
    functionStr: `${VAULT}::vault::get_total_safes`,
    chain: "aptos",
  });
  const total = Math.max(0, Number(totalRaw) || 0);
  logYieldAi(
    "get_total_safes raw:",
    safeJsonSample(totalRaw, 200),
    "→ parsed total:",
    total
  );

  const safeOut = [];
  const ownerOut = [];
  let pages = 0;
  let rawRowCount = 0;
  let existsTrueCount = 0;
  const sampleChainRows = [];

  for (let start = 0; start < total; start += PAGE_SIZE) {
    const limit = Math.min(PAGE_SIZE, total - start);
    const pageRaw = await function_view({
      functionStr: `${VAULT}::vault::get_safes_range_info`,
      args: [String(start), String(limit)],
      chain: "aptos",
    });
    pages += 1;
    if (VERBOSE && start === 0) {
      logYieldAi(
        "get_safes_range_info first page raw (truncated):",
        safeJsonSample(pageRaw, 4000)
      );
    }
    const unwrapped = unwrapVector(pageRaw);
    if (VERBOSE && start === 0) {
      logYieldAi(
        "unwrapVector length:",
        unwrapped.length,
        "first entry type:",
        unwrapped[0] == null
          ? "null"
          : Array.isArray(unwrapped[0])
            ? "array"
            : typeof unwrapped[0]
      );
    }
    const rows = unwrapped.map(normalizeSafeRow);
    rawRowCount += rows.length;

    for (const row of rows) {
      if (sampleChainRows.length < 5) {
        sampleChainRows.push({
          safe_address: row.safe_address,
          owner: row.owner,
          paused: row.paused,
          exists: row.exists,
        });
      }
      if (!truthyExists(row.exists)) continue;
      existsTrueCount += 1;
      const s = normalizeAptosAddress(row.safe_address);
      const o = normalizeAptosAddress(row.owner);
      if (s) safeOut.push(s);
      if (o) ownerOut.push(o);
    }

    logYieldAi(
      `page start=${start} limit=${limit} normalizedRows=${rows.length} cumulative exists=true=${existsTrueCount}`
    );
  }

  const safeAddresses = [...new Set(safeOut)];
  const ownerAddresses = [...new Set(ownerOut)];
  logYieldAi(
    "vault scan: pages=",
    pages,
    "rawRows=",
    rawRowCount,
    "exists=true=",
    existsTrueCount,
    "unique safes=",
    safeAddresses.length,
    "unique owners=",
    ownerAddresses.length
  );
  logYieldAi("sample chain rows:", safeJsonSample(sampleChainRows, 1200));

  return { safeAddresses, ownerAddresses };
}

async function indexerFaDiagnostics(graphQLClient, label, addresses) {
  let rowsTotal = 0;
  const sumByAsset = new Map();
  let skippedNative = 0;
  for (const batch of sliceIntoChunks(addresses, OWNER_BATCH_SIZE)) {
    const { current_fungible_asset_balances: rows } = await graphQLClient.request(
      FA_BALANCES_QUERY,
      { addresses: batch }
    );
    const list = rows || [];
    rowsTotal += list.length;
    for (const row of list) {
      if (isNativeAptFaRow(row.asset_type)) {
        skippedNative += 1;
        continue;
      }
      const amtStr = toIntegerString(row.amount);
      if (!amtStr || amtStr === "0" || /^-/.test(amtStr)) continue;
      const prev = sumByAsset.get(row.asset_type) || 0n;
      sumByAsset.set(row.asset_type, prev + BigInt(amtStr));
    }
  }
  const top = [...sumByAsset.entries()]
    .sort((a, b) => (a[1] < b[1] ? 1 : a[1] > b[1] ? -1 : 0))
    .slice(0, 10)
    .map(([asset, sum]) => ({ asset, rawSum: sum.toString() }));
  logYieldAi(
    `[diagnostic] FA ${label}: rows=${rowsTotal} skippedNativeApt=${skippedNative} top=`,
    safeJsonSample(top, 2000)
  );
  if (label.includes("user owner")) {
    logYieldAi(
      "[diagnostic] owner-wallet sums are not protocol-scoped (personal wallets)."
    );
  }
}

async function tvl(api) {
  const { safeAddresses, ownerAddresses } = await fetchExistingSafeAndOwnerAddresses();
  if (!safeAddresses.length) {
    if (VERBOSE) logYieldAi("no safes after vault scan");
    return;
  }

  const moarPools = await fetchMoarPoolsCached();
  const activeMoarPools = moarPools.filter((p) => !p.is_paused && p.underlyingInner);
  logYieldAi(
    "Moar pools cached:",
    moarPools.length,
    "active (not paused)=",
    activeMoarPools.length,
    safeJsonSample(
      activeMoarPools.map((p) => ({
        i: p.poolIndex,
        u: p.underlyingInner,
        n: p.name,
      })),
      2000
    )
  );

  const graphQLClient = new GraphQLClient(INDEXER_URL);

  if (VERBOSE && ownerAddresses.length) {
    await indexerFaDiagnostics(
      graphQLClient,
      "indexer owner=safe",
      safeAddresses
    );
    await indexerFaDiagnostics(
      graphQLClient,
      "indexer owner=wallet",
      ownerAddresses
    );
  }

  let faBatchIndex = 0;
  const faTotalsByAsset = new Map();

  for (const batch of sliceIntoChunks(safeAddresses, OWNER_BATCH_SIZE)) {
    faBatchIndex += 1;
    logYieldAi(`FA batch ${faBatchIndex} size=${batch.length}`);

    const { current_fungible_asset_balances: rows } = await graphQLClient.request(
      FA_BALANCES_QUERY,
      { addresses: batch }
    );

    const list = rows || [];
    logYieldAi(`FA batch ${faBatchIndex} indexer rows=${list.length}`);

    if (VERBOSE && list.length) {
      logYieldAi("FA sample:", safeJsonSample(list.slice(0, 3), 2500));
    }

    for (const row of list) {
      if (isNativeAptFaRow(row.asset_type)) continue;

      const amtStr = toIntegerString(row.amount);
      if (!amtStr || amtStr === "0" || /^-/.test(amtStr)) continue;

      const prev = faTotalsByAsset.get(row.asset_type) || 0n;
      faTotalsByAsset.set(row.asset_type, prev + BigInt(amtStr));

      api.add(row.asset_type, amtStr);
    }
  }

  logYieldAi(
    "FA done: batches=",
    faBatchIndex,
    "distinctAssets=",
    faTotalsByAsset.size
  );

  let aptOctasTotal = 0n;

  const aptPoolRes = await PromisePool.withConcurrency(COIN_BALANCE_CONCURRENCY)
    .for(safeAddresses)
    .process(async (addr) => {
      const bal = await function_view({
        functionStr: COIN_BALANCE_FN,
        type_arguments: [APT_TYPE_ARG],
        args: [addr],
        chain: "aptos",
      });
      const balStr = toIntegerString(bal);
      if (!balStr || balStr === "0") return;
      aptOctasTotal += BigInt(balStr);
      api.add(APT, balStr);
    });

  if (aptPoolRes?.errors?.length) {
    aptPoolRes.errors.slice(0, 3).forEach((e) => {
      console.error("[yield-ai] APT coin::balance error:", e);
    });
    throw new Error(
      `[yield-ai] APT coin::balance had ${aptPoolRes.errors.length} errors`
    );
  }

  logYieldAi("APT CoinStore total octas (approx log):", aptOctasTotal.toString());

  let moarAdds = 0;
  const moarTotalsByAsset = new Map();

  const jobs = [];
  for (const safe of safeAddresses) {
    for (const pool of activeMoarPools) {
      jobs.push({ safe, pool });
    }
  }

  const moarPoolRes = await PromisePool.withConcurrency(MOAR_LENS_CONCURRENCY)
    .for(jobs)
    .process(async ({ safe, pool }) => {
      const res = await function_view({
        functionStr: `${MOAR}::lens::get_lp_shares_and_deposited_amount`,
        args: [String(pool.poolIndex), safe],
        chain: "aptos",
      });
      const arr = Array.isArray(res) ? res : [];
      const depositedStr = toIntegerString(arr[1]);
      if (!depositedStr || depositedStr === "0") return;

      moarAdds += 1;
      const tok = pool.underlyingInner;
      const prev = moarTotalsByAsset.get(tok) || 0n;
      moarTotalsByAsset.set(tok, prev + BigInt(depositedStr));

      api.add(tok, depositedStr);
    });

  if (moarPoolRes?.errors?.length) {
    moarPoolRes.errors.slice(0, 3).forEach((e) => {
      console.error("[yield-ai] Moar lens error:", e);
    });
    throw new Error(`[yield-ai] Moar lens had ${moarPoolRes.errors.length} errors`);
  }

  logYieldAi(
    "Moar lens: non-zero deposit cells=",
    moarAdds,
    "by asset:",
    safeJsonSample(
      [...moarTotalsByAsset.entries()].map(([a, s]) => ({
        asset: a,
        raw: s.toString(),
      })),
      2000
    )
  );

  if (VERBOSE) {
    logYieldAi(
      "TVL build: safes=",
      safeAddresses.length,
      "FA asset kinds=",
      faTotalsByAsset.size,
      "Moar asset kinds=",
      moarTotalsByAsset.size
    );
  }
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  aptos: { tvl },
  methodology:
    "TVL sums (1) fungible-asset balances on each Yield AI vault safe object address (Aptos Labs indexer current_fungible_asset_balances, owner = safe), (2) native APT in 0x1 CoinStore per safe via 0x1::coin::balance<0x1::aptos_coin::AptosCoin> (FA rows for native APT are skipped to avoid double-count with CoinStore), and (3) Moar Market supply-side deposits attributed to each safe: Moar pool list from 0xa3afc59243afb6deeac965d40b25d509bb3aebc12f502b8592c283070abc2e07::pool::get_all_pools (paused pools excluded), then per (pool index, safe) 0xa3afc59243afb6deeac965d40b25d509bb3aebc12f502b8592c283070abc2e07::lens::get_lp_shares_and_deposited_amount; the deposited underlying amount is response index 1, added using each pool's underlying_asset metadata address (APT pool uses 0xa). Safes are enumerated with 0x333d1890e0aa3762bb256f5caeeb142431862628c63063801f44c152ef154700::vault get_total_safes / get_safes_range_info; only entries with exists true are included; paused safes remain included. This matches the product dashboard definition for on-safe plus Moar supply per safe. Moar is also listed separately on DefiLlama; combined chain aggregates may double-count the same underlying assets—maintainers should confirm presentation (see PR). Farming rewards are excluded. Data: Aptos fullnode view API (APTOS_RPC) and Aptos Labs indexer GraphQL for FA on safes.",
};
