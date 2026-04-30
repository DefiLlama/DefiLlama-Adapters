const ADDRESSES = require("../helper/coreAssets.json");
const axios = require("axios");
const { endpoint: APTOS_ENDPOINT, function_view } = require("../helper/chain/aptos");
const { GraphQLClient, gql } = require("graphql-request");
const { sliceIntoChunks } = require("../helper/utils");
const { PromisePool } = require("@supercharge/promise-pool");

const VAULT = "0x333d1890e0aa3762bb256f5caeeb142431862628c63063801f44c152ef154700";
const ECHELON = "0xc6bc659f1649553c1a3fa05d9727433dc03843baac29473c817d06d39e7621ba";
const INDEXER_URL = "https://api.mainnet.aptoslabs.com/v1/graphql";
const PAGE_SIZE = 50;
const APTOS_REST_TIMEOUT_MS = 10_000;
const APT = ADDRESSES.aptos.APT;
const APT_TYPE_ARG = "0x1::aptos_coin::AptosCoin";
const ECHELON_VAULT_RESOURCE = `${ECHELON}::lending::Vault`;

const FA_BALANCES_QUERY = gql`
  query YieldAiFaBalances($addresses: [String!]!) {
    current_fungible_asset_balances(where: { owner_address: { _in: $addresses } }) {
      owner_address
      amount
      asset_type
    }
  }
`;

function normalizeAddress(addr) {
  if (!addr || typeof addr !== "string") return null;
  const trimmed = addr.trim().toLowerCase();
  if (!trimmed) return null;
  return trimmed.startsWith("0x") ? trimmed : `0x${trimmed}`;
}

function normalizeObjectAddress(obj) {
  if (typeof obj === "string") return normalizeAddress(obj);
  return normalizeAddress(obj?.inner);
}

function toIntegerString(v) {
  if (v == null) return null;
  if (typeof v === "bigint") return v.toString();
  if (typeof v === "number") {
    if (!Number.isFinite(v)) return null;
    return BigInt(Math.trunc(v)).toString();
  }
  const s = String(v).trim();
  if (!/^\d+$/.test(s)) return null;
  return s;
}

async function retryAsync(fn, attempts = 5) {
  let lastError;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      if (i + 1 < attempts) await new Promise((resolve) => setTimeout(resolve, 500 * (i + 1)));
    }
  }
  throw lastError;
}

async function getEchelonVaultResource(safe) {
  const url = `${APTOS_ENDPOINT}/v1/accounts/${safe}/resource/${ECHELON_VAULT_RESOURCE}`;
  try {
    return (await axios.get(url, { timeout: APTOS_REST_TIMEOUT_MS })).data;
  } catch (e) {
    if (e?.response?.status === 404) return null;
    throw e;
  }
}

async function getAptBalance(addr) {
  const url = `${APTOS_ENDPOINT}/v1/accounts/${addr}/balance/${APT_TYPE_ARG}`;
  try {
    return (await axios.get(url, { timeout: APTOS_REST_TIMEOUT_MS })).data;
  } catch (e) {
    if (e?.response?.status === 404) return null;
    throw e;
  }
}

async function getSafeAddresses() {
  const total = Number(await function_view({ functionStr: `${VAULT}::vault::get_total_safes`, chain: "aptos" })) || 0;
  const safes = [];
  for (let start = 0; start < total; start += PAGE_SIZE) {
    const limit = Math.min(PAGE_SIZE, total - start);
    const page = await function_view({ functionStr: `${VAULT}::vault::get_safes_range_info`, args: [String(start), String(limit)], chain: "aptos" });
    const rows = Array.isArray(page?.[0]) ? page[0] : (Array.isArray(page) ? page : []);
    for (const row of rows) {
      const entry = Array.isArray(row) ? { safe_address: row[0], exists: row[3] } : row;
      if (entry.exists === true || entry.exists === "true" || entry.exists === "1") {
        const addr = normalizeAddress(entry.safe_address);
        if (addr) safes.push(addr);
      }
    }
  }
  return [...new Set(safes)];
}

async function sumEchelonSafePositions(api, safeAddresses) {
  const marketMetadataCache = new Map();

  async function getMarketMetadata(market) {
    if (!marketMetadataCache.has(market)) {
      const metadata = await retryAsync(() => function_view({
        functionStr: `${ECHELON}::lending::market_asset_metadata`,
        args: [market],
        chain: "aptos",
      }));
      marketMetadataCache.set(market, normalizeObjectAddress(metadata));
    }
    return marketMetadataCache.get(market);
  }

  const { errors } = await PromisePool.withConcurrency(1)
    .for(safeAddresses)
    .process(async (safe) => {
      const vault = await retryAsync(() => getEchelonVaultResource(safe));
      const collaterals = vault?.data?.collaterals?.data || [];

      for (const collateral of collaterals) {
        const market = normalizeObjectAddress(collateral?.key);
        const shares = toIntegerString(collateral?.value);
        if (!market || !shares || shares === "0") continue;

        const coins = await retryAsync(() => function_view({
          functionStr: `${ECHELON}::lending::shares_to_coins`,
          args: [market, shares],
          chain: "aptos",
        }));
        const amount = toIntegerString(coins);
        if (!amount || amount === "0") continue;

        const asset = await getMarketMetadata(market);
        if (asset) api.add(asset, amount);
      }
    });

  if (errors.length) throw errors[0];
}

async function tvl(api) {
  const safeAddresses = await getSafeAddresses();
  if (!safeAddresses.length) return;

  const graphQLClient = new GraphQLClient(INDEXER_URL);

  // Fungible asset balances on safes (excluding native APT to avoid double-count with CoinStore)
  for (const batch of sliceIntoChunks(safeAddresses, 30)) {
    const { current_fungible_asset_balances: rows } = await graphQLClient.request(FA_BALANCES_QUERY, { addresses: batch });
    for (const row of (rows || [])) {
      if (row.asset_type === APT || row.asset_type?.endsWith("::aptos_coin::AptosCoin")) continue;
      if (!row.amount || row.amount === "0") continue;
      api.add(row.asset_type, row.amount);
    }
  }

  await sumEchelonSafePositions(api, safeAddresses);

  // Native APT via CoinStore per safe
  for (const batch of sliceIntoChunks(safeAddresses, 2)) {
    await Promise.all(batch.map(async (addr) => {
      const bal = await retryAsync(() => getAptBalance(addr));
      if (bal && bal !== "0") api.add(APT, bal);
    }));
  }
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  aptos: { tvl },
  methodology:
    "TVL sums fungible-asset balances on Yield AI vault safe addresses, native APT in CoinStore per safe, and Echelon supply positions held by those safes. Echelon positions are read on-chain from each safe's Echelon lending Vault resource, converted from shares with shares_to_coins, and mapped to underlying assets with market_asset_metadata. The deprecated Moar route is excluded because those positions have been withdrawn. Echelon is listed separately on DefiLlama so doublecounted flag is set. Farming rewards are excluded.",
};
