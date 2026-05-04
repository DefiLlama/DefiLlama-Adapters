const ADDRESSES = require("../helper/coreAssets.json");
const { function_view } = require("../helper/chain/aptos");
const { GraphQLClient, gql } = require("graphql-request");
const { sliceIntoChunks } = require("../helper/utils");

const VAULT = "0x333d1890e0aa3762bb256f5caeeb142431862628c63063801f44c152ef154700";
const MOAR = "0xa3afc59243afb6deeac965d40b25d509bb3aebc12f502b8592c283070abc2e07";
const INDEXER_URL = "https://api.mainnet.aptoslabs.com/v1/graphql";
const PAGE_SIZE = 50;
const APT = ADDRESSES.aptos.APT;

const FA_BALANCES_QUERY = gql`
  query YieldAiFaBalances($addresses: [String!]!) {
    current_fungible_asset_balances(where: { owner_address: { _in: $addresses } }) {
      owner_address
      amount
      asset_type
    }
  }
`;

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
        const addr = entry.safe_address?.trim()?.toLowerCase();
        if (addr) safes.push(addr.startsWith("0x") ? addr : `0x${addr}`);
      }
    }
  }
  return [...new Set(safes)];
}

async function getMoarPools() {
  const pools = await function_view({ functionStr: `${MOAR}::pool::get_all_pools`, chain: "aptos" });
  if (!Array.isArray(pools)) return [];
  return pools.map((p, i) => ({
    index: i,
    underlying: p?.underlying_asset?.inner ? String(p.underlying_asset.inner).trim().toLowerCase() : null,
    paused: p?.is_paused === true,
  })).filter(p => !p.paused && p.underlying);
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

  // Native APT via CoinStore per safe
  for (const batch of sliceIntoChunks(safeAddresses, 10)) {
    await Promise.all(batch.map(async (addr) => {
      const bal = await function_view({
        functionStr: "0x1::coin::balance",
        type_arguments: [ADDRESSES.aptos.APT],
        args: [addr],
        chain: "aptos",
      });
      if (bal && bal !== "0") api.add(APT, bal);
    }));
  }

  // Moar Market supply-side deposits per safe
  const pools = await getMoarPools();
  for (const batch of sliceIntoChunks(safeAddresses, 8)) {
    const jobs = batch.flatMap(safe => pools.map(pool => ({ safe, pool })));
    await Promise.all(jobs.map(async ({ safe, pool }) => {
      const res = await function_view({
        functionStr: `${MOAR}::lens::get_lp_shares_and_deposited_amount`,
        args: [String(pool.index), safe],
        chain: "aptos",
      });
      const deposited = Array.isArray(res) ? res[1] : null;
      if (deposited && deposited !== "0") api.add(pool.underlying, deposited);
    }));
  }
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  aptos: { tvl },
  methodology:
    "TVL sums fungible-asset balances on Yield AI vault safe addresses (via Aptos indexer), native APT in CoinStore per safe, and Moar Market supply-side deposits attributed to each safe. Moar is listed separately on DefiLlama so doublecounted flag is set.",
};
