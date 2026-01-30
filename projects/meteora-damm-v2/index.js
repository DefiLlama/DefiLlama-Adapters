const { sumTokens2 } = require('../helper/solana')
const { getCache, setCache } = require('../helper/cache')
const { get } = require('../helper/http')
const { sleep } = require('../helper/utils')

const CACHE_NAME = 'meteora-damm-v2'
const MIN_TVL = 10_000

async function fetchPoolsFromApi() {
    const baseUrl = 'https://damm-v2.datapi.meteora.ag/pools/groups';
    const allPoolsUrl = 'https://dammv2-api.meteora.ag/pools';

    const validPoolGroups = new Set();

    let page = 1;
    const pageSize = 99;
    // get pool groups with TVL > 10k
    while (true) {
        const response = await get(`${baseUrl}?page=${page}&page_size=${pageSize}&sort_by=tvl%3Adesc&filter_by=is_blacklisted%3A%3Dfalse&fee_tvl_ratio_tw=fee_tvl_ratio_24h&volume_tw=volume_24h`);
        const pools = response.data || [];
        if (pools.length === 0) break;

        const lastPool = pools[pools.length - 1];
        if (lastPool.total_tvl < MIN_TVL) break;

        for (const pool of pools) {
            const tvl = pool.total_tvl || 0;
            if (tvl < MIN_TVL) continue;

            validPoolGroups.add(pool.group_name);
        }

        await sleep(100);
        page++;
    }

    // Fetch all pools sorted by TVL descending, stop when TVL drops below MIN_TVL
    const tokenAccounts = [];
    let offset = 0;

    while (true) {
        const response = await get(`${allPoolsUrl}?offset=${offset}&order_by=tvl&order=desc`);
        const poolsArray = response.data || response || [];
        if (poolsArray.length === 0) break;

        let belowThreshold = false;
        for (const pool of poolsArray) {
            // If pool TVL is below threshold, we can break (sorted desc)
            const poolTvl = pool.tvl || 0;
            if (poolTvl < MIN_TVL) {
                belowThreshold = true;
                break;
            }

            if (validPoolGroups.has(pool.pool_name)) {
                if (pool.token_a_vault) tokenAccounts.push(pool.token_a_vault);
                if (pool.token_b_vault) tokenAccounts.push(pool.token_b_vault);
            }
        }
        if (belowThreshold) break;

        await sleep(100);
        offset += 50;
    }

    return tokenAccounts;
}

async function tvl(api) {
    // try to get cache first
    let tokenAccounts = await getCache(CACHE_NAME, api.chain);

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
    methodology: 'TVL is calculated by summing token balances in Meteora DAMM v2 liquidity pools with TVL > $10k.'
}