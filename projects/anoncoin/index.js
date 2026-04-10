const { getCache, setCache } = require("../helper/cache");
const { sumTokens2 } = require("../helper/solana");
const { get } = require("../helper/http");
const { sleep } = require("../helper/utils");

const API_BASE = "https://api.dubdub.tv/v1/defillama/tvl";
const CACHE_KEY = "anoncoin-vaults";
const MAX_PAGES = 1000;

async function fetchAllVaults() {
    const solOwnersSet = new Set();
    let page = 1;
    let hasMore = true;
    let fullFetchCompleted = false;

    while (hasMore) {
        if (page > MAX_PAGES) {
            console.error(`anoncoin: exceeded MAX_PAGES (${MAX_PAGES}), stopping pagination`);
            break;
        }

        const { data } = await get(`${API_BASE}?page=${page}`);
        const pools = data.pools || [];

        for (const pool of pools) {
            if (pool.isMigrated && pool.dammV2QuoteVault) {
                solOwnersSet.add(pool.dammV2QuoteVault);
            } else if (pool.quoteVault) {
                solOwnersSet.add(pool.quoteVault);
            }
        }

        hasMore = data.hasMore === true;
        page++;

        if (hasMore) await sleep(200);
    }

    if (!hasMore) fullFetchCompleted = true;

    return { solOwners: [...solOwnersSet], fullFetchCompleted };
}

async function tvl() {
    let solOwners;
    try {
        const result = await fetchAllVaults();
        solOwners = result.solOwners;
        if (result.fullFetchCompleted) {
            await setCache(CACHE_KEY, "solana", solOwners);
        }
    } catch (e) {
        console.error("anoncoin: API fetch failed, falling back to cache", e.message);
        const cached = await getCache(CACHE_KEY, "solana");
        solOwners = Array.isArray(cached) ? cached : [];
    }

    return sumTokens2({ solOwners });
}

module.exports = {
    timetravel: false,
    methodology:
        "TVL is calculated by summing the SOL held in all Anoncoin pool quote vaults (DBC and DAMM v2) on Solana. Only pools with TVL > 0 are included.",
    solana: {
        tvl,
    },
};
