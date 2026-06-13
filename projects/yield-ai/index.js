const ADDRESSES = require("../helper/coreAssets.json");
const { function_view, getResource } = require("../helper/chain/aptos");
const { GraphQLClient, gql } = require("graphql-request");
const { sliceIntoChunks } = require("../helper/utils");

const VAULT = "0x333d1890e0aa3762bb256f5caeeb142431862628c63063801f44c152ef154700";
const ECHELON = "0xc6bc659f1649553c1a3fa05d9727433dc03843baac29473c817d06d39e7621ba";
const INDEXER_URL = "https://api.mainnet.aptoslabs.com/v1/graphql";
const PAGE_SIZE = 50;
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

// Address fields can be a string or { inner: string }
const objAddr = (o) => typeof o === "string" ? o : o?.inner;

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

async function getSafeAddresses() {
  const total = Number(await function_view({ functionStr: `${VAULT}::vault::get_total_safes`, chain: "aptos" })) || 0;
  const safes = [];
  for (let start = 0; start < total; start += PAGE_SIZE) {
    const limit = Math.min(PAGE_SIZE, total - start);
    const page = await function_view({ functionStr: `${VAULT}::vault::get_safes_range_info`, args: [String(start), String(limit)], chain: "aptos" });
    const rows = Array.isArray(page?.[0]) ? page[0] : (Array.isArray(page) ? page : []);
    for (const row of rows) {
      const entry = Array.isArray(row) ? { safe_address: row[0], exists: row[3] } : row;
      if (entry.exists) {
        if (entry.safe_address) safes.push(entry.safe_address);
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
      marketMetadataCache.set(market, objAddr(metadata));
    }
    return marketMetadataCache.get(market);
  }

  for (const batch of sliceIntoChunks(safeAddresses, 10)) {
    await Promise.all(batch.map(async (safe) => {
      // Returns null if safe has no Echelon vault resource 
      const vault = await getResource(safe, ECHELON_VAULT_RESOURCE).catch(() => null);
      const collaterals = vault?.collaterals?.data || [];

      for (const collateral of collaterals) {
        const market = objAddr(collateral?.key);
        const shares = collateral?.value;
        if (!market || !shares || shares === "0") continue;

        const amount = await retryAsync(() => function_view({
          functionStr: `${ECHELON}::lending::shares_to_coins`,
          args: [market, shares],
          chain: "aptos",
        }));
        if (!amount || amount === "0") continue;

        const asset = await getMarketMetadata(market);
        if (asset) api.add(asset, amount);
      }
    }));
  }
}

async function tvl(api) {
  const safeAddresses = await getSafeAddresses();
  if (!safeAddresses.length) return;

  const graphQLClient = new GraphQLClient(INDEXER_URL);

  // Fungible asset balances on safes (including native APT)
  for (const batch of sliceIntoChunks(safeAddresses, 30)) {
    const { current_fungible_asset_balances: rows } = await graphQLClient.request(FA_BALANCES_QUERY, { addresses: batch });
    for (const row of (rows || [])) {
      if (!row.amount || row.amount === "0") continue;
      api.add(row.asset_type, row.amount);
    }
  }

  await sumEchelonSafePositions(api, safeAddresses);
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  aptos: { tvl },
  methodology:
    "TVL sums fungible-asset balances on Yield AI vault safe addresses (including APT) and Echelon supply positions held by those safes. Echelon positions are read on-chain from each safe's Echelon lending Vault resource, converted from shares with shares_to_coins, and mapped to underlying assets with market_asset_metadata. The deprecated Moar route is excluded because those positions have been withdrawn. Echelon is listed separately on DefiLlama so doublecounted flag is set. Farming rewards are excluded.",
};
