const { sumTokens2 } = require('../helper/solana')
const { getCache, setCache, getConfig } = require('../helper/cache')
const { get } = require('../helper/http')
const { sleep } = require('../helper/utils')

const CACHE_NAME = 'meteora-dlmm'
const MAX_PAGES = 200
const MIN_TVL = 10_000
const baseUrl = 'https://dlmm.datapi.meteora.ag/pools'

// Build a canonical pair key from two mint addresses to match the groups endpoint's `lexical_order_mints`
const pairKey = (mintA, mintB) => [mintA, mintB].sort().join('-')

async function fetchPoolsFromApi() {
    

    const validPoolPairs = new Set();
    let groupsPage = 1;
    const pageSize = 99;

    while (groupsPage < MAX_PAGES) {
        const response = await get(`${baseUrl}/groups?page=${groupsPage}&page_size=${pageSize}&sort_by=tvl%3Adesc&filter_by=is_blacklisted%3A%3Dfalse`);
        const groups = response.data || [];
        if (groups.length === 0) break;
        for (const group of groups) {
            if ((group.total_tvl || 0) >= MIN_TVL) validPoolPairs.add(group.lexical_order_mints);
        }
        // Groups are TVL-sorted desc; once last group on page falls below MIN_TVL, all subsequent pages will too.
        const lastGroup = groups[groups.length - 1];
        if ((lastGroup.total_tvl || 0) < MIN_TVL) break;

        await sleep(100);
        groupsPage++;
    }

    const tokenAccounts = [];
    let poolsPage = 1;

    while (poolsPage < MAX_PAGES) {
        const response = await get(`${baseUrl}?page=${poolsPage}&page_size=${pageSize}&sort_by=tvl%3Adesc`);
        const pools = response.data || [];
        if (pools.length === 0) break;

        for (const pool of pools) {
            if (validPoolPairs.has(pairKey(pool.token_x.address, pool.token_y.address))) {
                if (pool.reserve_x) tokenAccounts.push(pool.reserve_x);
                if (pool.reserve_y) tokenAccounts.push(pool.reserve_y);
            }
        }

        const lastPool = pools[pools.length - 1];
        if ((lastPool.tvl || 0) < 0.01) break;

        await sleep(100);
        poolsPage++;
    }

    return tokenAccounts;
}

async function tvl(api) {
    const tokenAccounts = await getConfig(CACHE_NAME, undefined, { fetcher: fetchPoolsFromApi })
    if (!tokenAccounts || !Array.isArray(tokenAccounts) || tokenAccounts.length === 0) return {}
    return sumTokens2({ tokenAccounts })
}


module.exports = {
    timetravel: false,
    isHeavyProtocol: true,
    solana: { tvl },
    methodology: 'TVL is calculated by summing token balances in Meteora DLMM liquidity pools.'
}