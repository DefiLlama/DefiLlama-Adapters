const { sumTokens2 } = require("../helper/solana");
const { getConfig } = require("../helper/cache");

const API_BASE = "https://api.dubdub.tv/v1/defillama/tvl";

async function fetchAllVaults() {
  const solOwners = new Set();
  let page = 1;
  let hasMore = true;
  while (hasMore && page <= 200) {
    const { data } = await getConfig(`anoncoin/tvl-page-${page}`, `${API_BASE}?page=${page}`);
    for (const pool of (data.pools || [])) {
      if (pool.isMigrated) continue;
      if (pool.quoteVault) solOwners.add(pool.quoteVault);
    }
    hasMore = data.hasMore === true;
    page++;
  }
  if (hasMore) {
    throw new Error(`Anoncoin vault pagination exceeded 200 pages; TVL may be incomplete`);
  }
  return [...solOwners];
}

async function tvl() {
  return sumTokens2({ solOwners: await fetchAllVaults() });
}

module.exports = {
  timetravel: false,
  methodology: "TVL is the SOL held in Anoncoin pool quote vaults on Solana, graduated pairs migrated to Meteora are excluded.",
  solana: { tvl },
};
