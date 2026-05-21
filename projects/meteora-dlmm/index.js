const { sumTokens2 } = require('../helper/solana')
const { getCache, setCache } = require('../helper/cache')
const { get } = require('../helper/http')
const { sleep } = require('../helper/utils')

const CACHE_NAME = 'meteora-dlmm'

async function fetchPoolsFromApi() {
    const baseUrl = 'https://dlmm.datapi.meteora.ag/pools'

    const validPoolGroups = new Set();
    let page = 1;
    const pageSize = 99;

    while (true) {
        const response = await get(`${baseUrl}/groups?page=${page}&page_size=${pageSize}&sort_by=tvl%3Adesc&filter_by=is_blacklisted%3A%3Dfalse`);
        const groups = response.data || [];
        if (groups.length === 0) break;
        for (const group of groups) validPoolGroups.add(group.group_name);
        const lastGroup = groups[groups.length - 1];
        if ((lastGroup.total_tvl || 0) < 0.01) break;

        await sleep(100);
        page++;
    }

    const tokenAccounts = [];
    let poolsPage = 1;

    while (true) {
        const response = await get(`${baseUrl}?page=${poolsPage}&page_size=${pageSize}&order_by=tvl&order=desc`);
        const pools = response.data || [];
        if (pools.length === 0) break;

        for (const pool of pools) {
            const reversed = pool.name.split('-').reverse().join('-');
            if (validPoolGroups.has(pool.name) || validPoolGroups.has(reversed)) {
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
    let tokenAccounts = await getCache(CACHE_NAME, api.chain)

    if (!tokenAccounts || !Array.isArray(tokenAccounts) || tokenAccounts.length === 0) {
        tokenAccounts = await fetchPoolsFromApi();
        await setCache(CACHE_NAME, api.chain, tokenAccounts);
    }

    return sumTokens2({ tokenAccounts });
}

module.exports = {
    timetravel: false,
    isHeavyProtocol: true,
    solana: { tvl },
    methodology: 'TVL is calculated by summing token balances in Meteora DLMM liquidity pools.'
}