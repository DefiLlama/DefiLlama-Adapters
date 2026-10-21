const ADDRESSES = require("../helper/coreAssets.json");
const { aQuery, function_view, getResources } = require("../helper/chain/aptos");
const { GraphQLClient, gql } = require("graphql-request");
const { sliceIntoChunks } = require("../helper/utils");
const { PromisePool } = require("@supercharge/promise-pool");
const sdk = require('@defillama/sdk');
const { getEnv } = require("../helper/env");
const pLimit = require("p-limit");

const VAULT =
  "0x333d1890e0aa3762bb256f5caeeb142431862628c63063801f44c152ef154700";

const ECHELON =
  "0xc6bc659f1649553c1a3fa05d9727433dc03843baac29473c817d06d39e7621ba";

const ECHELON_VAULT_RESOURCE = `${ECHELON}::lending::Vault`;
const HYPERION_LP_RESOURCE = `${VAULT}::vault::VaultHyperionLp`;
const SAFE_RESOURCE = `${VAULT}::vault::VaultPosition`;

const HYPERION_DEX =
  "0x8b4a2c4bb53857c718a04c020b98f8c2e1f99a68b0f57389a8bf5434cd22e05c";

/** Decibel protocol vault (DLP). Its share token is posted by Yield AI safes as Echelon collateral. */
const DECIBEL =
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06";
const DLP_VAULT =
  "0x06ad70a9a4f30349b489791e2f2bcf58363dad30e54a9d2d4095d6213d7a9bf9";
const DLP_SHARE =
  "0x119860710560b43277b7663ff587081d57f167e2c156de7d60c483028bf9b146";
const USDC = ADDRESSES.aptos.USDC_3;

const INDEXER_URL = "https://api.mainnet.aptoslabs.com/v1/graphql";
const INDEXER_PAGE_SIZE = 100; // the indexer caps responses at 100 rows
const INDEXER_TIMEOUT_MS = 30_000;
const PAGE_SIZE = 50;
const OWNER_BATCH_SIZE = 30;
const ECHELON_CONCURRENCY = 4;
const HYPERION_LP_CONCURRENCY = 8;
const RESOURCE_CONCURRENCY = 4;
const FULLNODE_CONCURRENCY = 2;
const FULLNODE_INTERVAL_MS = 200;
const RATE_LIMIT_WINDOW_MS = 300_000;

/** Known Hyperion pools used by Yield AI safes (token_a/token_b = pool canonical order). */
const YIELD_AI_HYPERION_POOLS = [
  {
    poolAddress:
      "0xa7bb8c9b3215e29a3e2c2370dcbad9c71816d385e7863170b147243724b2da58",
    tokenA:
      "0x68844a0d7f2587e726ad0579f3d640865bb4162c08a4589eeda3f9689ec52a3d",
    tokenB:
      ADDRESSES.aptos.USDC_3,
    feeTier: 1,
  },
];

// Native APT is included: the indexer reports coin and FA APT as one 0x1::aptos_coin::AptosCoin row.
const FA_BALANCES_QUERY = gql`
  query YieldAiFaBalances($addresses: [String!]!, $limit: Int!, $offset: Int!) {
    current_fungible_asset_balances(
      where: { owner_address: { _in: $addresses }, amount: { _gt: "0" } }
      order_by: [{ owner_address: asc }, { storage_id: asc }]
      limit: $limit
      offset: $offset
    ) {
      owner_address
      amount
      asset_type
    }
  }
`;

function unwrapVector(raw) {
  if (raw == null) return [];
  if (!Array.isArray(raw)) return [];
  if (raw.length === 1 && Array.isArray(raw[0])) return raw[0];
  return raw;
}

function normalizeAptosAddress(addr) {
  if (!addr || typeof addr !== "string") return null;
  const trimmed = addr.trim();
  const withPrefix = trimmed.startsWith("0x") ? trimmed : `0x${trimmed}`;
  return withPrefix.toLowerCase();
}

/** Aptos object addresses are often shortened on-chain; pad for stable pricing keys. */
function padAptosAddress(addr) {
  const normalized = normalizeAptosAddress(addr);
  if (!normalized) return null;
  const hex = normalized.slice(2);
  if (!/^[0-9a-f]+$/.test(hex)) return normalized;
  return `0x${hex.padStart(64, "0")}`;
}

function normalizeObjectAddress(obj) {
  if (typeof obj === "string") return normalizeAptosAddress(obj);
  return normalizeAptosAddress(obj?.inner);
}

/**
 * Exponential backoff with jitter, for indexer requests only. Fullnode reads go through the SDK,
 * which already retries transient errors (429, 5xx, timeouts) and skips deterministic ones such
 * as Move aborts; wrapping those again multiplies the delays and can stall the run.
 */
async function retryAsync(fn, attempts = 5) {
  let lastError;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      if (i + 1 < attempts) {
        const delay = Math.min(8000, 500 * 2 ** i) * (0.5 + Math.random() / 2);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

/** Pace all fullnode reads together; the SDK handles transport retries and pagination. */
function createFullnodeReader() {
  const requests = pLimit(FULLNODE_CONCURRENCY);
  const starts = pLimit(1);
  let nextStart = 0;
  let reads = 0;
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  async function read(fn) {
    for (let attempt = 0; ; attempt++) {
      try {
        return await requests(async () => {
          await starts(async () => {
            // Another in-flight request can extend the shared cooldown while this sleeps.
            while (Date.now() < nextStart) await sleep(nextStart - Date.now());
            nextStart = Date.now() + FULLNODE_INTERVAL_MS;
          });
          reads++;
          return await fn();
        });
      } catch (e) {
        if ((e.status ?? e.response?.status) !== 429 || attempt === 1) throw e;
        const header = e.response?.headers?.["retry-after"];
        const seconds = header == null ? NaN : Number(header);
        const retryAt = Date.parse(header);
        const delay = Number.isFinite(seconds)
          ? Math.max(1000, seconds * 1000)
          : Number.isFinite(retryAt) ? Math.max(1000, retryAt - Date.now()) : RATE_LIMIT_WINDOW_MS;
        nextStart = Math.max(nextStart, Date.now() + delay);
        sdk.log(`Yield AI: fullnode quota exhausted, waiting ${Math.ceil(delay / 1000)}s before retrying`);
      }
    }
  }
  return {
    view: (options) => read(() => function_view(options)),
    resources: (safe) => read(() => getResources(safe, "aptos")),
    query: (path) => read(() => aQuery(path, "aptos")),
    get reads() { return reads; },
  };
}

function unwrapScalar(res) {
  return Array.isArray(res) ? res[0] : res;
}

/**
 * DLP shares have no price feed, so they are counted as the USDC they redeem for, at the vault's
 * own on-chain NAV. Both views return 6-decimal base units, the same as USDC, so
 * usdc = shares * net_asset_value / num_shares needs no decimal adjustment.
 */
async function getDlpNav(reader) {
  // Read both views at one ledger version, so NAV and share count describe the same vault
  // state even if a contribution or redemption lands between the two calls.
  const { ledger_version: ledgerVersion } = await reader.query("/v1");
  const viewAt = (fn) =>
    reader.view({
      functionStr: `${DECIBEL}::vault::${fn}`,
      args: [DLP_VAULT],
      ledgerVersion,
      chain: "aptos",
    });
  const nav = await viewAt("get_vault_net_asset_value");
  const shares = await viewAt("get_vault_num_shares");
  return { nav: BigInt(unwrapScalar(nav)), shares: BigInt(unwrapScalar(shares)) };
}

/** Per-run DLP pricer: the NAV is read once per run, never reused across runs. */
function createDlpAdder(api, reader) {
  let navPromise;
  return async (sharesRaw) => {
    if (!navPromise) navPromise = getDlpNav(reader);
    const { nav, shares } = await navPromise;
    if (shares === 0n) return;
    const usdc = (BigInt(sharesRaw) * nav) / shares;
    if (usdc > 0n) api.add(USDC, usdc.toString());
  };
}

/** Views return metadata inner; keep 0xa-style APT shorthand as-is (lower case). */
function normalizeUnderlyingTokenId(inner) {
  if (inner == null) return null;
  const s = String(inner).trim().toLowerCase();
  if (!s) return null;
  if (s === "0xa") return "0xa";
  return s.startsWith("0x") ? s : `0x${s}`;
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

/** Hyperion ticks are i32 stored as two's-complement u32 on-chain. */
function decodeI32Tick(raw) {
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  if (n >= 0x80000000) return n - 0x100000000;
  return Math.trunc(n);
}

function tickToSqrtPrice(tick) {
  return Math.pow(1.0001, tick / 2);
}

function pairKey(tokenA, tokenB) {
  const a = normalizeUnderlyingTokenId(tokenA);
  const b = normalizeUnderlyingTokenId(tokenB);
  if (!a || !b) return null;
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

function buildHyperionPoolLookup() {
  const byPair = new Map();
  for (const pool of YIELD_AI_HYPERION_POOLS) {
    const key = pairKey(pool.tokenA, pool.tokenB);
    if (key) byPair.set(key, pool);
  }
  return byPair;
}

const HYPERION_POOL_BY_PAIR = buildHyperionPoolLookup();

function unwrapPositionAddresses(raw) {
  if (raw == null) return [];
  if (!Array.isArray(raw)) return [];
  if (raw.length === 1 && Array.isArray(raw[0])) return raw[0];
  if (raw.length && typeof raw[0] === "object" && raw[0] != null) return [];
  return raw;
}

function normalizeHyperionPosition(raw, positionFallback) {
  if (raw == null) return null;
  const entry = Array.isArray(raw) ? raw[0] : raw;
  if (!entry || typeof entry !== "object") return null;

  const position =
    normalizeAptosAddress(entry.position) ||
    normalizeAptosAddress(positionFallback);
  const tokenA = normalizeUnderlyingTokenId(entry.token_a ?? entry.tokenA);
  const tokenB = normalizeUnderlyingTokenId(entry.token_b ?? entry.tokenB);
  const tickLower = decodeI32Tick(entry.tick_lower ?? entry.tickLower);
  const tickUpper = decodeI32Tick(entry.tick_upper ?? entry.tickUpper);

  return {
    position,
    tokenA,
    tokenB,
    feeTier: Number(entry.fee_tier ?? entry.feeTier ?? 0),
    tickLower,
    tickUpper,
    closed: entry.closed === true,
    liquidity: toIntegerString(entry.liquidity),
    amountA: toIntegerString(entry.amount_a ?? entry.amountA),
    amountB: toIntegerString(entry.amount_b ?? entry.amountB),
  };
}

function computeAmountsFromLiquidity({
  liquidity,
  tickLower,
  tickUpper,
  currentTick,
}) {
  const liqStr = toIntegerString(liquidity);
  if (
    !liqStr ||
    liqStr === "0" ||
    tickLower == null ||
    tickUpper == null ||
    currentTick == null
  ) {
    return { amountA: null, amountB: null };
  }

  const L = Number(liqStr);
  if (!Number.isFinite(L) || L <= 0) return { amountA: null, amountB: null };

  const sp = tickToSqrtPrice(currentTick);
  const spa = tickToSqrtPrice(tickLower);
  const spb = tickToSqrtPrice(tickUpper);
  if (!Number.isFinite(sp) || !Number.isFinite(spa) || !Number.isFinite(spb)) {
    return { amountA: null, amountB: null };
  }

  let amountA = 0;
  let amountB = 0;

  if (currentTick < tickLower) {
    amountA = (L * (spb - spa)) / (spa * spb);
  } else if (currentTick >= tickUpper) {
    amountB = L * (spb - spa);
  } else {
    amountA = (L * (spb - sp)) / (sp * spb);
    amountB = L * (sp - spa);
  }

  const amountAStr = toIntegerString(Math.max(0, Math.floor(amountA)));
  const amountBStr = toIntegerString(Math.max(0, Math.floor(amountB)));
  return { amountA: amountAStr, amountB: amountBStr };
}

async function resolveHyperionPoolAddress(pos, reader) {
  const key = pairKey(pos.tokenA, pos.tokenB);
  const known = key ? HYPERION_POOL_BY_PAIR.get(key) : null;
  if (known?.poolAddress) return known.poolAddress;

  // liquidity_pool_address_safe returns a (bool exists, address) tuple
  const res = await reader.view({
    functionStr: `${HYPERION_DEX}::pool_v3::liquidity_pool_address_safe`,
    args: [pos.tokenA, pos.tokenB, pos.feeTier],
    chain: "aptos",
  });
  const [exists, addr] = Array.isArray(res) ? res : [false, null];
  return exists ? normalizeAptosAddress(addr) : null;
}

async function getHyperionPoolCurrentTick(poolAddress, tickCache, reader) {
  const pool = normalizeAptosAddress(poolAddress);
  if (!pool) return null;
  if (tickCache.has(pool)) {
    return tickCache.get(pool);
  }

  const res = await reader.view({
    functionStr: `${HYPERION_DEX}::pool_v3::current_tick_and_price`,
    args: [pool],
    chain: "aptos",
  });
  const tickRaw = Array.isArray(res) ? res[0] : res;
  const tick = decodeI32Tick(tickRaw);
  tickCache.set(pool, tick);
  return tick;
}

async function resolveHyperionPositionAmounts(pos, tickCache, reader) {
  let amountA = pos.amountA;
  let amountB = pos.amountB;
  const hasLiveA = amountA && amountA !== "0";
  const hasLiveB = amountB && amountB !== "0";
  if (hasLiveA || hasLiveB) return { amountA, amountB };

  if (pos.position) {
    const routerRes = await reader.view({
      functionStr: `${HYPERION_DEX}::router_v3::get_amount_by_liquidity`,
      args: [pos.position],
      chain: "aptos",
    });
    if (Array.isArray(routerRes)) {
      amountA = toIntegerString(routerRes[0]);
      amountB = toIntegerString(routerRes[1]);
      if (
        (amountA && amountA !== "0") ||
        (amountB && amountB !== "0")
      ) {
        return { amountA, amountB };
      }
    }
  }

  const poolAddress = await resolveHyperionPoolAddress(pos, reader);
  if (!poolAddress) return { amountA: null, amountB: null };

  const currentTick = await getHyperionPoolCurrentTick(poolAddress, tickCache, reader);
  return computeAmountsFromLiquidity({
    liquidity: pos.liquidity,
    tickLower: pos.tickLower,
    tickUpper: pos.tickUpper,
    currentTick,
  });
}

/**
 * @returns {{ safeAddresses: string[] }}
 */
async function fetchRegisteredSafes(reader) {
  const totalRaw = await reader.view({
    functionStr: `${VAULT}::vault::get_total_safes`,
    chain: "aptos",
  });
  const total = Math.max(0, Number(totalRaw) || 0);

  const safeOut = [];
  for (let start = 0; start < total; start += PAGE_SIZE) {
    const limit = Math.min(PAGE_SIZE, total - start);
    const pageRaw = await reader.view({
      // Owner/policy are unused by TVL. Check existence during the resource read instead.
      functionStr: `${VAULT}::vault::get_safes_range`,
      args: [String(start), String(limit)],
      chain: "aptos",
    });
    for (const address of unwrapVector(pageRaw)) {
      // The view returns some safes without leading zeros; the indexer matches owner_address as an
      // exact 64-hex string, so an unpadded safe would silently lose its fungible-asset balances.
      const s = padAptosAddress(address);
      if (s) safeOut.push(s);
    }
  }

  return { safeAddresses: [...new Set(safeOut)] };
}

/** A fully paginated resource read replaces both per-safe existence views. */
async function fetchSafeResources(reader, safeAddresses) {
  const { results } = await PromisePool.withConcurrency(RESOURCE_CONCURRENCY)
    .for(safeAddresses)
    .handleError((e) => { throw e; })
    .process(async (safe) => {
      let resources;
      try {
        resources = await reader.resources(safe);
      } catch (e) {
        // A registry entry can outlive its object. Other read failures remain fatal.
        if ((e.status ?? e.response?.status) === 404 && e.errorCode === "account_not_found") return null;
        throw e;
      }
      if (!Array.isArray(resources)) throw new Error(`Invalid resources for safe ${safe}`);
      // Matches get_safes_range_info's object::object_exists<VaultPosition> check.
      if (!resources.some(({ type }) => type === "0x1::object::ObjectCore") ||
          !resources.some(({ type }) => type === SAFE_RESOURCE)) return null;
      const vault = resources.find(({ type }) => type === ECHELON_VAULT_RESOURCE);
      if (vault && (!vault.data || typeof vault.data !== "object"))
        throw new Error(`Invalid Echelon resource for safe ${safe}`);
      return {
        safe,
        echelonVault: vault?.data,
        hasHyperion: resources.some(({ type }) => type === HYPERION_LP_RESOURCE),
      };
    });
  return results.filter(Boolean);
}

async function sumEchelonSafePositions(api, safeResources, addDlpAsUsdc, reader) {
  const marketMetadataCache = new Map();
  let adds = 0;
  const totalsByAsset = new Map();

  async function getMarketMetadata(market) {
    if (!marketMetadataCache.has(market)) {
      const metadata = await reader.view({
        functionStr: `${ECHELON}::lending::market_asset_metadata`,
        args: [market],
        chain: "aptos",
      });
      marketMetadataCache.set(
        market,
        padAptosAddress(normalizeObjectAddress(metadata))
      );
    }
    return marketMetadataCache.get(market);
  }

  await PromisePool.withConcurrency(ECHELON_CONCURRENCY)
    .for(safeResources.filter(({ echelonVault }) => echelonVault))
    .handleError((e) => { throw e; }) // a failed read must fail the run, not drop the safe's TVL
    .process(async ({ safe, echelonVault }) => {
      const collaterals = echelonVault.collaterals?.data || [];

      for (const collateral of collaterals) {
        const market = padAptosAddress(
          normalizeObjectAddress(collateral?.key)
        );
        if (!market) continue;

        const coins = await reader.view({
          functionStr: `${ECHELON}::lending::account_coins`,
          args: [safe, market],
          chain: "aptos",
        });
        const amount = toIntegerString(coins);
        if (!amount || amount === "0") continue;

        const asset = await getMarketMetadata(market);
        if (!asset) continue;

        adds += 1;
        const prev = totalsByAsset.get(asset) || 0n;
        totalsByAsset.set(asset, prev + BigInt(amount));
        if (asset === DLP_SHARE) await addDlpAsUsdc(amount);
        else api.add(asset, amount);
      }
    });

  return { adds, totalsByAsset };
}

async function tvl(api) {
  const reader = createFullnodeReader();
  const registered = await fetchRegisteredSafes(reader);
  const safeResources = await fetchSafeResources(reader, registered.safeAddresses);
  const safeAddresses = safeResources.map(({ safe }) => safe);
  if (!safeAddresses.length) return;
  const addDlpAsUsdc = createDlpAdder(api, reader);
  const { adds: echelonAdds, totalsByAsset: echelonTotalsByAsset } =
    await sumEchelonSafePositions(api, safeResources, addDlpAsUsdc, reader);

  // the SDK sends the same key on fullnode views
  const indexerHeaders = {};
  const apiKey = getEnv("APTOS_API_KEY");
  if (apiKey) indexerHeaders.Authorization = `Bearer ${apiKey}`;
  const graphQLClient = new GraphQLClient(INDEXER_URL, { headers: indexerHeaders });

  const faTotalsByAsset = new Map();

  for (const batch of sliceIntoChunks(safeAddresses, OWNER_BATCH_SIZE)) {
    for (let offset = 0; ; offset += INDEXER_PAGE_SIZE) {
      // a fresh signal per attempt, so a hung request is aborted and retried instead of
      // blocking the run forever
      const { current_fungible_asset_balances: rows = [] } = await retryAsync(() =>
        graphQLClient.request({
          document: FA_BALANCES_QUERY,
          variables: { addresses: batch, limit: INDEXER_PAGE_SIZE, offset },
          signal: AbortSignal.timeout(INDEXER_TIMEOUT_MS),
        })
      );

      for (const row of rows) {
        const amtStr = toIntegerString(row.amount);
        if (!amtStr || amtStr === "0" || /^-/.test(amtStr)) continue;

        const prev = faTotalsByAsset.get(row.asset_type) || 0n;
        faTotalsByAsset.set(row.asset_type, prev + BigInt(amtStr));

        if (padAptosAddress(row.asset_type) === DLP_SHARE) await addDlpAsUsdc(amtStr);
        else api.add(row.asset_type, amtStr);
      }

      if (rows.length < INDEXER_PAGE_SIZE) break;
    }
  }

  let hyperionAdds = 0;
  const hyperionTotalsByAsset = new Map();
  const tickCache = new Map();

  await PromisePool.withConcurrency(HYPERION_LP_CONCURRENCY)
    .for(safeResources.filter(({ hasHyperion }) => hasHyperion))
    .handleError((e) => { throw e; }) // required position reads must not drop Hyperion TVL
    .process(async ({ safe }) => {
      const positionsRaw = await reader.view({
        functionStr: `${VAULT}::vault::get_hyperion_positions`,
        args: [safe],
        chain: "aptos",
      });

      const positionAddresses = unwrapPositionAddresses(positionsRaw);
      if (!positionAddresses.length) return;

      for (const positionAddr of positionAddresses) {
        const posRaw = await reader.view({
          functionStr: `${VAULT}::vault::get_hyperion_position`,
          args: [safe, positionAddr],
          chain: "aptos",
        });

        const pos = normalizeHyperionPosition(posRaw, positionAddr);
        if (!pos || pos.closed) continue;

        const { amountA, amountB } = await resolveHyperionPositionAmounts(pos, tickCache, reader);

        if (amountA && amountA !== "0" && pos.tokenA) {
          hyperionAdds += 1;
          const prev = hyperionTotalsByAsset.get(pos.tokenA) || 0n;
          hyperionTotalsByAsset.set(pos.tokenA, prev + BigInt(amountA));
          api.add(pos.tokenA, amountA);
        }

        if (amountB && amountB !== "0" && pos.tokenB) {
          hyperionAdds += 1;
          const prev = hyperionTotalsByAsset.get(pos.tokenB) || 0n;
          hyperionTotalsByAsset.set(pos.tokenB, prev + BigInt(amountB));
          api.add(pos.tokenB, amountB);
        }
      }
    });

  sdk.log(
    `Yield AI TVL: safes=${safeAddresses.length} | FA=${faTotalsByAsset.size} assets | ` +
      `Echelon=${echelonAdds} cells/${echelonTotalsByAsset.size} assets | ` +
      `Hyperion=${hyperionAdds} cells/${hyperionTotalsByAsset.size} assets | Fullnode=${reader.reads} reads`
  );
}

module.exports = {
  timetravel: false,
  isHeavyProtocol: true,
  doublecounted: true,
  aptos: { tvl },
  methodology: "Counts fungible-asset balances on Yield AI safe addresses, including native APT (Aptos indexer), Echelon supply positions held by safes, and open Hyperion CLMM LP positions. Decibel DLP vault shares (held or posted as Echelon collateral) are counted as USDC at the vault's on-chain net asset value per share. Echelon, Hyperion and Decibel are also tracked as separate protocols (doublecounted: true).",
};
