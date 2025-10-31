const { queryContract } = require('../helper/chain/cosmos');
const { transformBalances } = require('../helper/portedTokens');

const FACTORY_CONTRACT = 'zig1xx3aupmgv3ce537c0yce8zzd3sz567syaltr2tdehu3y803yz6gsc6tz85';
const API_CALL_DELAY = 10; // Rate limit throttling for public REST API
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // Initial retry delay in ms

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function withRetry(fn, maxAttempts = MAX_RETRIES) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            if (attempt === maxAttempts) {
                throw error;
            }
            const delay = RETRY_DELAY * attempt; // Exponential backoff
            console.error(`Attempt ${attempt} failed, retrying in ${delay}ms:`, error.message);
            await sleep(delay);
        }
    }
}

async function getAllPairs() {
    const allPairs = [];
    let startAfter = undefined;
    const limit = 30;

    while (true) {
        const query = { pairs: { limit } };
        if (startAfter) {
            query.pairs.start_after = startAfter;
        }

        try {
            const response = await withRetry(() => queryContract({
                contract: FACTORY_CONTRACT,
                chain: 'zigchain',
                data: query
            }));

            if (!response.pairs || response.pairs.length === 0) {
                break;
            }

            allPairs.push(...response.pairs);

            const lastPair = response.pairs[response.pairs.length - 1];
            const nextCursor = { asset_infos: lastPair.asset_infos, pair_type: lastPair.pair_type };
            if (response.pairs.length < limit) {
                break;
            }
            if (startAfter && JSON.stringify(startAfter) === JSON.stringify(nextCursor)) {
                break;
            }
            startAfter = nextCursor;
            await sleep(API_CALL_DELAY);
        } catch (error) {
            console.error('Failed to fetch pairs from factory:', error);
            throw error;
        }
    }

    return allPairs;
}

async function getPoolInfo(contractAddr) {
    try {
        return await withRetry(() => queryContract({
            contract: contractAddr,
            chain: 'zigchain',
            data: { pool: {} }
        }));
    } catch (error) {
        console.error(`Failed to fetch pool info for ${contractAddr} after retries:`, error);
        return null;
    }
}

function getAssetKey(assetInfo) {
    if (assetInfo.native_token) {
        return assetInfo.native_token.denom;
    } else if (assetInfo.token) {
        return assetInfo.token.contract_addr;
    }
    return null;
}

async function tvl(api) {
    try {
        const pairs = await getAllPairs();

        for (const pair of pairs) {
            const poolInfo = await getPoolInfo(pair.contract_addr);
            if (!poolInfo || !poolInfo.assets) {
                continue;
            }

            for (const asset of poolInfo.assets) {
                const assetKey = getAssetKey(asset.info);
                if (assetKey && asset.amount) {
                    api.add(assetKey, asset.amount);
                }
            }

            await sleep(API_CALL_DELAY);
        }
        return transformBalances('zigchain', api.getBalances());
    } catch (error) {
        console.error('Error calculating TVL:', error);
        throw error;
    }
}

module.exports = {
    timetravel: false,
    misrepresentedTokens: false,
    methodology: 'TVL is calculated by summing all assets locked in OroSwap liquidity pools on ZIGChain',
    zigchain: { tvl }
};