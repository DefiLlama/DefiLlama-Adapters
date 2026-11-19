const ADDRESSES = require("../helper/coreAssets.json");
const { aQuery, function_view } = require("../helper/chain/aptos");
const { sliceIntoChunks } = require("../helper/utils");
const { PromisePool } = require("@supercharge/promise-pool");
const sdk = require('@defillama/sdk');
const pLimit = require("p-limit");

const VAULT =
  "0x333d1890e0aa3762bb256f5caeeb142431862628c63063801f44c152ef154700";

const ECHELON =
  "0xc6bc659f1649553c1a3fa05d9727433dc03843baac29473c817d06d39e7621ba";

const ECHELON_VAULT_RESOURCE = `${ECHELON}::lending::Vault`;
const HYPERION_LP_RESOURCE = `${VAULT}::vault::VaultHyperionLp`;

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
// These direct balances are intentionally excluded from Yield AI TVL.
const EXCLUDED_DIRECT_ASSETS = new Set([
  "0xfaf4e633ae9eb31366c9ca24214231760926576c7b625313b3688b5e900731f6::staking::ThalaAPT",
  "0x51964f09020498a1421a2a3bafe8e1d9fa72574b60446486c599bc6f3e9fae29::echelon_coin::ELON",
]);

const INDEXER_PAGE_SIZE = 100; // the indexer caps responses at 100 rows
const INDEXER_TIMEOUT_MS = 30_000;
const PAGE_SIZE = 50;
const OWNER_BATCH_SIZE = 100; // indexer latency is per request, not per owner
const HYPERION_LP_CONCURRENCY = 8;
const RESOURCE_CONCURRENCY = 8;
const FULLNODE_CONCURRENCY = 8;

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
// Empty stores are kept so their storage_id can be told apart from position objects.
const FA_BALANCES_QUERY = `
  query YieldAiFaBalances($addresses: [String!]!, $limit: Int!, $offset: Int!) {
    current_fungible_asset_balances(
      where: { owner_address: { _in: $addresses } }
      order_by: [{ owner_address: asc }, { storage_id: asc }]
      limit: $limit
      offset: $offset
    ) {
      owner_address
      storage_id
      amount
      asset_type
    }
  }
`;

// Live objects owned by safes: fungible stores plus open LP positions (closed positions are deleted).
const LIVE_OBJECTS_QUERY = `
  query YieldAiObjects($addresses: [String!]!, $limit: Int!, $offset: Int!) {
    current_objects(
      where: { owner_address: { _in: $addresses }, is_deleted: { _eq: false } }
      order_by: [{ owner_address: asc }, { object_address: asc }]
      limit: $limit
      offset: $offset
    ) {
      owner_address
      object_address
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
 * Cap all fullnode reads together. The SDK already retries transient errors (429, 5xx, timeouts);
 * a rate limit that outlasts those retries fails the run instead of stalling it into a timeout.
 * Resources are read one type at a time: listing an account's resources needs the statekeys index,
 * which some nodes in the rotation lack.
 */
function createFullnodeReader() {
  const limit = pLimit(FULLNODE_CONCURRENCY);
  let reads = 0;
  const read = (fn) => limit(() => {
    reads++;
    return fn();
  });
  return {
    view: (options) => read(() => function_view(options)),
    // null when the account does not hold the resource
    resource: (account, type) => read(() => sdk.chains.aptos.getResource({ chain: "aptos", account, type })),
    query: (path) => read(() => aQuery(path, "aptos")),
    get reads() { return reads; },
  };
}

/** Paged indexer query over safe owners; the SDK retries and sends APTOS_API_KEY. */
async function queryIndexerByOwners(query, key, owners) {
  const rows = [];
  for (const batch of sliceIntoChunks(owners, OWNER_BATCH_SIZE)) {
    for (let offset = 0; ; offset += INDEXER_PAGE_SIZE) {
      const data = await sdk.chains.aptos.indexerQuery({
        chain: "aptos",
        query,
        variables: { addresses: batch, limit: INDEXER_PAGE_SIZE, offset },
        timeout: INDEXER_TIMEOUT_MS,
      });
      const page = data?.[key] ?? [];
      rows.push(...page);
      if (page.length < INDEXER_PAGE_SIZE) break;
    }
  }
  return rows;
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
      // exists is object::object_exists<VaultPosition>: a registry entry can outlive its object
      functionStr: `${VAULT}::vault::get_safes_range_info`,
      args: [String(start), String(limit)],
      chain: "aptos",
    });
    for (const info of unwrapVector(pageRaw)) {
      if (info?.exists !== true) continue;
      // The view returns some safes without leading zeros; the indexer matches owner_address as an
      // exact 64-hex string, so an unpadded safe would silently lose its fungible-asset balances.
      const s = padAptosAddress(info.safe_address);
      if (s) safeOut.push(s);
    }
  }

  return { safeAddresses: [...new Set(safeOut)] };
}

/**
 * Echelon collateral is stored as market shares. Shares are summed per market across safes and
 * converted with one shares_to_coins view per market, instead of one account_coins view per position.
 */
async function sumEchelonSafePositions(api, safeAddresses, addDlpAsUsdc, reader) {
  const sharesByMarket = new Map();
  let adds = 0;

  await PromisePool.withConcurrency(RESOURCE_CONCURRENCY)
    .for(safeAddresses)
    .handleError((e) => { throw e; }) // a failed read must fail the run, not drop the safe's TVL
    .process(async (safe) => {
      const vault = await reader.resource(safe, ECHELON_VAULT_RESOURCE);
      if (vault == null) return;
      if (typeof vault !== "object") throw new Error(`Invalid Echelon resource for safe ${safe}`);

      for (const collateral of vault.collaterals?.data || []) {
        const market = padAptosAddress(normalizeObjectAddress(collateral?.key));
        const shares = toIntegerString(collateral?.value);
        if (!market || !shares || shares === "0") continue;
        adds += 1;
        sharesByMarket.set(market, (sharesByMarket.get(market) || 0n) + BigInt(shares));
      }
    });

  const totalsByAsset = new Map();
  for (const [market, shares] of sharesByMarket) {
    const coins = await reader.view({
      functionStr: `${ECHELON}::lending::shares_to_coins`,
      args: [market, shares.toString()],
      chain: "aptos",
    });
    const amount = toIntegerString(coins);
    if (!amount || amount === "0") continue;

    const metadata = await reader.view({
      functionStr: `${ECHELON}::lending::market_asset_metadata`,
      args: [market],
      chain: "aptos",
    });
    const asset = padAptosAddress(normalizeObjectAddress(metadata));
    if (!asset) continue;

    totalsByAsset.set(asset, (totalsByAsset.get(asset) || 0n) + BigInt(amount));
    if (asset === DLP_SHARE) await addDlpAsUsdc(amount);
    else api.add(asset, amount);
  }

  return { adds, totalsByAsset };
}

async function tvl(api) {
  const reader = createFullnodeReader();
  const { safeAddresses } = await fetchRegisteredSafes(reader);
  if (!safeAddresses.length) return;
  const addDlpAsUsdc = createDlpAdder(api, reader);
  const { adds: echelonAdds, totalsByAsset: echelonTotalsByAsset } =
    await sumEchelonSafePositions(api, safeAddresses, addDlpAsUsdc, reader);

  const faTotalsByAsset = new Map();
  const storeIds = new Set();
  const balances = await queryIndexerByOwners(FA_BALANCES_QUERY, "current_fungible_asset_balances", safeAddresses);

  for (const row of balances) {
    storeIds.add(row.storage_id);
    if (EXCLUDED_DIRECT_ASSETS.has(row.asset_type)) continue;
    const amtStr = toIntegerString(row.amount);
    if (!amtStr || amtStr === "0" || /^-/.test(amtStr)) continue;

    const prev = faTotalsByAsset.get(row.asset_type) || 0n;
    faTotalsByAsset.set(row.asset_type, prev + BigInt(amtStr));

    if (padAptosAddress(row.asset_type) === DLP_SHARE) await addDlpAsUsdc(amtStr);
    else api.add(row.asset_type, amtStr);
  }

  // Any live object a safe owns that is not a fungible store is an open LP position, so only those
  // safes are read for Hyperion, and only their live positions (closed ones are deleted objects).
  const liveObjectsBySafe = new Map();
  for (const { owner_address, object_address } of await queryIndexerByOwners(LIVE_OBJECTS_QUERY, "current_objects", safeAddresses)) {
    if (storeIds.has(object_address)) continue;
    if (!liveObjectsBySafe.has(owner_address)) liveObjectsBySafe.set(owner_address, new Set());
    liveObjectsBySafe.get(owner_address).add(padAptosAddress(object_address));
  }

  let hyperionAdds = 0;
  const hyperionTotalsByAsset = new Map();
  const tickCache = new Map();

  await PromisePool.withConcurrency(HYPERION_LP_CONCURRENCY)
    .for([...liveObjectsBySafe])
    .handleError((e) => { throw e; }) // required position reads must not drop Hyperion TVL
    .process(async ([safe, liveObjects]) => {
      // also excludes safes whose only live position is on Thala
      const lp = await reader.resource(safe, HYPERION_LP_RESOURCE);
      if (!lp || Number(lp.open_count) === 0) return;

      const positionsRaw = await reader.view({
        functionStr: `${VAULT}::vault::get_hyperion_positions`,
        args: [safe],
        chain: "aptos",
      });

      const positionAddresses = unwrapPositionAddresses(positionsRaw)
        .filter((p) => liveObjects.has(padAptosAddress(p)));
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
  methodology: "Counts fungible-asset balances on Yield AI safe addresses, including native APT (Aptos indexer), Echelon supply positions held by safes, and open Hyperion CLMM LP positions. Direct ThalaAPT and ELON balances are excluded. Decibel DLP vault shares (held or posted as Echelon collateral) are counted as USDC at the vault's on-chain net asset value per share. Echelon, Hyperion and Decibel are also tracked as separate protocols (doublecounted: true).",
};
