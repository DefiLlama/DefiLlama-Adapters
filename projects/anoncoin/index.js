const { sumTokens2 } = require("../helper/solana");
const { get } = require("../helper/http");
const { sleep } = require("../helper/utils");

const API_BASE = "https://api.dubdub.tv/v1/defillama/tvl";
const MAX_PAGES = 1000;

async function fetchAllVaults() {
    const solOwnersSet = new Set();
    let page = 1;
    let hasMore = true;

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

    return { solOwners: [...solOwnersSet] };
}

async function tvl() {
    const { solOwners } = await fetchAllVaults();
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
